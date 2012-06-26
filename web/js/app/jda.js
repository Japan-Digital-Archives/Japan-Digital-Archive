
// This contains the module definition factory function, application state,
// events, and the router.
this.jda = {
	// break up logical components of code into modules.
	module: function()
	{
		// Internal module cache.
		var modules = {};

		// Create a new module reference scaffold or load an existing module.
		return function(name) 
		{
			// If this module has already been created, return it
			if (modules[name]) return modules[name];

			// Create a module and save it under this name
			return modules[name] = { Views: {} };
		};
	}(),

  // Keep active application instances namespaced under an app object.
  app: _.extend({
	apiLocation : sessionStorage.getItem("apiUrl"),
	currentView : 'list',
	resultsPerPage : 100,
	
	init : function(){
		// make item collection
		this.currentFilter=null;
		var Browser = jda.module("browser");
		this.resultsView = new Browser.Items.Collections.Views.Results();
		this.eventMap = new Browser.Views.EventMap();
		this.initCollectionsDrawer();
	},
	
	initCollectionsDrawer: function(){
		var Browser = jda.module("browser");
		this.myCollectionsDrawer = new Browser.Items.Collections.Views.MyCollectionsDrawer();
		this.myCollectionsDrawer.getCollectionList();
	},
	
	search : function(params, useValuesFromURL){		
		var _this = this;
		//Parse out search box values for putting them in the Search query
		if (useValuesFromURL)
		{
			//get the search query from URL and put it in the search box			
			this.updateSearchUI(params);
		}
		else
		{
			//Use content value from format dropdown
			
			params.content = $('#zeega-content-type').val();

			//Parse searchbox values
			var facets = VisualSearch.searchQuery.models;
			
			
			var tagQuery = "tag:";
			var textQuery = "";
			var usernameQuery = "";

			_.each(facets, function(facet){
				console.log(facet.get('category'));
				switch ( facet.get('category') )
				{
					case 'text':
						textQuery = (textQuery.length > 0) ? textQuery + " AND " + facet.get('value') : facet.get('value'); 
						break;
					case 'tag':
						tagQuery = (tagQuery.length > 4) ? tagQuery + ", " + facet.get('value') : tagQuery + facet.get('value');
						break;
					case 'user':
						usernameQuery = facet.get('value');
						break;
					
			    }
			});
			
			params.q = textQuery + (textQuery.length > 0 && tagQuery.length > 4 ? " " : "") + (tagQuery.length > 4 ? tagQuery : "");
			params.text = textQuery;
			params.viewType = this.currentView;
			params.username = usernameQuery;
		}
		
		if (!_.isUndefined(params.view_type))  this.switchViewTo(params.view_type,false) ;
		
		if (params.view_type == 'event' && !this.eventMap.timeSliderLoaded)
		{
			this.setEventViewTimePlace(params);
		}
		this.resultsView.search( params,true );
		
		
		if (this.currentView == 'event')
		{
		    
			if(!_.isUndefined( this.resultsView.getCQLSearchString())&&this.eventMap.mapLoaded)
			{
				_this.eventMap.map.getLayersByName('cite:item - Tiled')[0].mergeNewParams({
					'CQL_FILTER' : this.resultsView.getCQLSearchString()
				});
			}
		}
		
	},
	
	updateSearchUI : function(obj){
		var q = obj.q;
		if (!_.isUndefined(q))
		{
			//check for tags
			if (q.indexOf("tag:") >=0){
				var tagPart = q.substr(q.indexOf("tag:") + 4);
				var tagNames = tagPart.split(" ");
				for(var i=0;i<tagNames.length;i++)
				{
					var tagName = tagNames[i];
					VisualSearch.searchBox.addFacet('tag', tagName, 0);
				}
			}
			//check for text
			var textPart = q.indexOf("tag:") >= 0 ? q.substr(0,  q.indexOf("tag:")) : q;
			if (textPart.length > 0)
			{
				var texts = textPart.split(",");
				for(var i=0;i<texts.length;i++)
				{
					var text = texts[i];
					VisualSearch.searchBox.addFacet('text', text, 0);
				}
			}
			
		}
		if (!_.isUndefined(obj.content)){
			$('#zeega-content-type').val(obj.content);
			$('#select-wrap-text').text( $('#zeega-content-type option[value=\''+$('#zeega-content-type').val()+'\']').text() );
		}
		
		
	},
	
	setEventViewTimePlace : function(obj){
		if (!_.isUndefined(obj.start))
		{
			oldValues =  $("#range-slider").slider( "option", "values" );
			$( "#range-slider" ).slider( "option", "values", [obj.start, oldValues[1]] );
		}
		if (!_.isUndefined(obj.end))
		{
			oldValues =  $("#range-slider").slider( "option", "values" );
			$( "#range-slider" ).slider( "option", "values", [oldValues[0], obj.end]);
		}
		if (!_.isUndefined(obj.map_bounds))
		{
			coords = (obj.map_bounds).split(',');
			bounds = new OpenLayers.Bounds(coords[0], coords[1], coords[2], coords[3]);
			this.eventMap.map.zoomToExtent(bounds);
		}
 	},

	switchViewTo : function( view , refresh ){
		var _this=this;
		this.resultsView.setView(view);
		if( view != this.currentView )
		{
			
			if(this.currentView=="event") refresh=true;
			else refresh =false;
			
			//$('#'+this.currentView+'-view').hide();
			this.currentView = view;
			$('.tab-pane').removeClass('active');
			$('#zeega-'+view+'-view').addClass('active');
			
 	 		//$(this).hide();
			switch( this.currentView )
			{
				case 'list':
					this.showListView();
					break;
				case 'event':
					this.showEventView();
					break;
				case 'thumb':
					this.showThumbnailView();
					break;
				default:
					console.log('view type not recognized')
			}
			if(refresh){
				$('#zeega-results-count').fadeOut('fast');
				this.resultsView.collection.fetch({
					success : function(model, response){ 
						_this.resultsView.render();       
					}
				});
			}
			
		}
	},
	
	/***************************************************************************
		- model: either collection or user
		- filterType: Filters are type either "collection" or "user"
		- searchParams: Optionally pass in searchParams to have it set other things on search
	***************************************************************************/
	
	addFilter : function(model, filterType, searchParams){
		
		console.log("adding filter", filterType);
		
		
		/*******  UX ***/
		
		$('.tab-content').find('.btn-group').hide();
		$('#jda-related-tags').hide();
		
		/****** END UX **********/

		if (searchParams == null){
			searchParams = new Object();
		}
		searchParams.page = 1;

		var Browser = jda.module("browser");
		this.clearSearchFilters(false);
		
		if (filterType == 'collection'){
			//clear out user filter - you can't have both
			if (this.resultsView.userFilter != null) this.removeFilter('user',searchParams,false);
			
			
			$('#jda-left').css("margin-top","276px");
			this.currentFilterType ="collection";
			
			this.resultsView.collectionFilter = new Browser.Items.Views.CollectionPage({model:model});
			searchParams.r_items=1;
			searchParams.r_itemswithcollections=0;
			searchParams.collection = model.id;
			console.log(searchParams);
			this.search(searchParams);
		
		} else if (filterType == 'user'){
			
			
			
			//clear out collection filter - you can't have both
			if (this.resultsView.collectionFilter != null) this.removeFilter('collection',searchParams,false);
			
			this.currentFilterType ="user";
			$('#jda-left').css("margin-top","165px");
			
			var Browser = jda.module("browser");
			//the r_collections parameter separates the items and collections in the search results
			searchParams.r_collections=1;
			searchParams.r_items=1;
			searchParams.r_itemswithcollections=0;
			this.resultsView.userFilter = new Browser.Users.Views.UserPage({model:model});
			searchParams.user = model.id;
			this.search(searchParams);
		}

	},
	
	
	/***************************************************************************
		- filterType: Filters are type either "collection" or "user"
		- searchParams: Optionally pass in searchParams to have it set other things on search
		- doSearch: Optionally make app request new items or not, default is TRUE
	***************************************************************************/
	
	removeFilter : function(filterType, searchParams, clearAll){
		console.log("removeFilter",this.currentFilterType);		
		if (searchParams == null){
			searchParams = new Object();
		}
		if (clearAll == null){
			clearAll = true;
		}
		
		if(filterType == 'current') filterType=this.currentFilterType;
			
		if(clearAll){
		
			$('.tab-content').find('.btn-group').show();
			$('#jda-left').css("margin-top", "0px");
			$('#jda-related-tags').fadeIn('fast');
			this.currenFilterType=null;
			
		}
		

	
	
		if (filterType == 'collection'){
		
			console.log("removing collection filter");
			//remove collectionFilter view which takes care of UI
			if(!_.isUndefined(this.resultsView.collectionFilter))this.resultsView.collectionFilter.remove();

			//set filter to null
			this.resultsView.collectionFilter = null;

			//remove search parameter from JDA app
			searchParams.collection = '';
		} 
		else if (filterType == 'user'){
		
			console.log("removing user filter");
			
			//remove collectionFilter view which takes care of UI
			this.resultsView.userFilter.remove();

			//set filter to null
			this.resultsView.userFilter = null;

			//remove the item/collection separation
			searchParams.r_collections=0;

			//remove search parameter from JDA app
			searchParams.user = '';
		}
		

	},
	
	addCommas : function(nStr){
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	},
	
	showListView : function(){
		console.log('switch to List view');

	    
		$('#zeega-view-buttons .btn').removeClass('active');
		$('#list-button').addClass('active');
		

		$('#jda-right').show();
		$('#event-time-slider').hide();
		$('#zeega-results-count').removeClass('zeega-results-count-event');
		$('#zeega-results-count').css('left', 0);
		$('#zeega-results-count').css('z-index', 0);

		$('#zeega-results-count-text-with-date').hide();

		if(this.resultsView.updated)
		{
			console.log('render collection')
			this.resultsView.render();
		}
		
	},
	
	showThumbnailView : function(){
	
		$('#zeega-view-buttons .btn').removeClass('active');
		$('#thumb-button').addClass('active');
		
		$('#jda-right').show();
		$('#event-time-slider').hide();
		$('#zeega-results-count').removeClass('zeega-results-count-event');
		$('#zeega-results-count').css('left', 0);
		$('#zeega-results-count').css('z-index', 0);

		$('#zeega-results-count-text-with-date').hide();
		
		if(this.resultsView.updated)
		{
			console.log('render collection')
			this.resultsView.render();
		}
	},
	
	showEventView : function(){
		console.log('switch to Event view');
		$('#zeega-view-buttons .btn').removeClass('active');
		$('#event-button').addClass('active');
		
		$('#jda-right').hide();
		$('#event-time-slider').show();
		$('#zeega-results-count').addClass('zeega-results-count-event');
		$('#zeega-results-count').offset( { top:$('#zeega-results-count').offset().top, left:10 } );
		$('#zeega-results-count').css('z-index', 1000);

		$('#zeega-results-count-text-with-date').show();
		
		var removedFilters = "";
		var _this = this;
		_.each( VisualSearch.searchBox.facetViews, function( facet ){
			if( facet.model.get('category') == 'tag' || facet.model.get('category') == 'collection' ||
				facet.model.get('category') == 'user') 
			{
				facet.model.set({'value': null });
				facet.remove();
				removedFilters += facet.model.get('category') + ": " + facet.model.get('value') + " ";
				
				
			}
			if( facet.model.get('category') == 'tag'){
				_this.resultsView.clearTags();
			}
			if( facet.model.get('category') == 'collection' ||
				facet.model.get('category') == 'user') {
				_this.removeFilter(facet.model.get('category'),_this.resultsView.getSearch());
				_this.resultsView.setURLHash();
			}
			
		})
		if (removedFilters.length > 0){
			$('#removed-tag-name').text(removedFilters);
			$('#remove-tag-alert').show('slow');
			setTimeout(function() {
			  $('#remove-tag-alert').hide('slow');
			}, 3000);
		}
		
		$("#zeega-event-view").width($(window).width());
		this.eventMap.load();
	},
	
	
	
	clearSearchFilters : function(doSearch){
	
		console.log('clearSearchFilters called with doSearch',doSearch);
    
    	if (doSearch == null) doSearch = true;
		
    	$('#zeega-content-type').val("all");
    	$('#select-wrap-text').text( $('#zeega-content-type option[value=\''+$('#zeega-content-type').val()+'\']').text() );

    	//remove search box values
    	VisualSearch.searchBox.disableFacets();
	    VisualSearch.searchBox.value('');
	  	VisualSearch.searchBox.flags.allSelected = false;
	  	if(doSearch) this.search({ page:1,});
	},

	initAdvSearch : function(){
		// do init code here
    },




	/***************************************************************************
		- called when user authentication has occured
	***************************************************************************/
	userAuthenticated: function(){
	
		console.log("you're logged in now!");
		
		sessionStorage.setItem('user','1');
		$('#zeega-my-collections-share-and-organize').html('Saving collection...');
		var _this=this;
		console.log(this.myCollectionsDrawer.activeCollection);
		if(this.myCollectionsDrawer.activeCollection.get('new_items').length>0){
			this.myCollectionsDrawer.activeCollection.save({},{
				success:function(model,response){
					console.log('saved collection');
					_this.initCollectionsDrawer();
				}
			});
		}
		else this.initCollectionsDrawer();
	},




	
	goToAuthorPage : function(userId){
		var _this = this;
		this.clearSearchFilters(false);

		//retrieve user object and then add user filter
		var Browser = jda.module("browser");
		var authorModel = new Browser.Users.Model({id:userId});
		authorModel.fetch({
			success : function(model, response){
				jda.app.addFilter(model,'user', {collection:''});
			},
			error : function(model, response){
				console.log('Failed to fetch the user object.');
				console.log(model);
			},

		});
		
	},
	
	goToCollectionsPage : function(){ 
		this.removeFilter("current",null,true);
	}
		
	
	
	
	
	
	
	
	
	
	
	
	
}, Backbone.Events)


};
