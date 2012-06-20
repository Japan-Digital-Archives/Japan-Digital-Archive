
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
		
		if (params.view_type == 'event')
		{
			this.setEventViewTimePlace(params);
		}
		this.resultsView.search( params );
		
		
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
		
		this.resultsView.setView(view);
		if( view != this.currentView )
		{
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
				var searchView=this.resultsView;
				searchView.collection.fetch({
					success : function(model, response){ 
						searchView.renderTags(response.tags);
						searchView.render();      
						$('#zeega-results-count-number').text(jda.app.addCommas(response["items_count"]));        
						$('#zeega-results-count').fadeTo(100, 1);
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
		
		if (searchParams == null){
			searchParams = new Object();
		}
		searchParams.page = 1;

		var Browser = jda.module("browser");
		this.clearSearchFilters();
		
		if (filterType == 'collection'){
			
			//clear out user filter - you can't have both
			if (this.resultsView.userFilter != null){
				this.removeFilter('user',searchParams,false);
			}
			this.resultsView.collectionFilter = new Browser.Items.Views.CollectionPage({model:model});
			searchParams.collection = model.id;
			this.search(searchParams);
		
		} else if (filterType == 'user'){

			//clear out collection filter - you can't have both
			if (this.resultsView.collectionFilter != null){
				this.removeFilter('collection',searchParams,false);
			}
			
			var Browser = jda.module("browser");
			//the r_collections parameter separates the items and collections in the search results
			searchParams.r_collections=1;
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
	
	removeFilter : function(filterType, searchParams, doSearch){
		if (searchParams == null){
			searchParams = new Object();
		}
		if (doSearch == null){
			doSearch = true;
		}
		//reset height of main results content & my collections
		$('.tab-content').removeClass('jda-low-top');
		

		if (filterType == 'collection'){
			//remove collectionFilter view which takes care of UI
			if(!_.isUndefined(this.resultsView.collectionFilter))this.resultsView.collectionFilter.remove();

			//set filter to null
			this.resultsView.collectionFilter = null;

			//remove search parameter from JDA app
			searchParams.collection = '';
			if (doSearch){
				this.search(searchParams);
			}
		} 
		else if (filterType == 'user'){
			//remove collectionFilter view which takes care of UI
			this.resultsView.userFilter.remove();

			//set filter to null
			this.resultsView.userFilter = null;

			//remove the item/collection separation
			searchParams.r_collections=0;

			//remove search parameter from JDA app
			searchParams.user = '';
			if (doSearch){
				this.search(searchParams);
			}
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

		
		//Time slider disabled for now
		//$('#event-time-slider').hide();
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
		
		//Time slider disabled for now
		//$('#event-time-slider').show();
		$('#zeega-results-count').addClass('zeega-results-count-event');
		$('#zeega-results-count').offset( { top:$('#zeega-results-count').offset().top, left:10 } );
		$('#zeega-results-count').css('z-index', 1000);

		$('#zeega-results-count-text-with-date').show();
		
		_.each( VisualSearch.searchBox.facetViews, function( facet ){
			if( facet.model.get('category') == 'tag' ) {
				var facetValue = facet.model.get('value');
				facet.model.set({'value': null });
				facet.remove();
				$('#removed-tag-name').text(facetValue);
				$('#remove-tag-alert').show('slow');
				setTimeout(function() {
				  $('#remove-tag-alert').hide('slow');
				}, 3000);
			}
			
		})
		
		$("#zeega-event-view").width($(window).width());
		this.eventMap.load();
	},
	

	//NOTE - this does not search, it only clears out all the filters in the search box UI
	clearSearchFilters : function()
	{
    	//clear out the content filter
    	$('#zeega-content-type').val("all");
    	$('#select-wrap-text').text( $('#zeega-content-type option[value=\''+$('#zeega-content-type').val()+'\']').text() );

    	//remove search box values
    	VisualSearch.searchBox.disableFacets();
	    VisualSearch.searchBox.value('');
	  	VisualSearch.searchBox.flags.allSelected = false;
	},

	initAdvSearch : function()
	{
		// do init code here
    },
	getLeftColumnWidth : function(){
		var width = ($(window).width() - $('#zeega-right-column').width() - 0.1 * $(window).width()) - 30;
		var minwidth = parseInt($('#zeega-left-column').css('min-width'), 10);
		
		return Math.max(width, minwidth);
	},
	getRightColumnPosition: function(){
		var left = this.getLeftColumnWidth() + $('#zeega-left-column').offset().left + 105;
		return left;	
	},
	/***************************************************************************
		- called from ux.search and then anytime window is resized
	***************************************************************************/
	redrawLayout:function(){
		$('#zeega-left-column').css("width", jda.app.getLeftColumnWidth());
	    $('#jda-collection-filter').css("width", $('#zeega-main-content').width() );
	    $('#jda-user-filter').css("width", jda.app.getLeftColumnWidth() );
	    $('.jda-separate-collections-and-items').css("width", jda.app.getLeftColumnWidth() );
	    $('.left-col').css("width", jda.app.getLeftColumnWidth() );

	    $('#zeega-right-column').css("left", jda.app.getRightColumnPosition());
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
}, Backbone.Events)


};
