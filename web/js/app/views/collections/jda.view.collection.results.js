(function(Browser) {
		Browser.Items = Browser.Items || {};
		Browser.Items.Collections = Browser.Items.Collections || {};
		Browser.Items.Collections.Views =  Browser.Items.Collections.Views || {};
	
	Browser.Items.Collections.Views.Results = Backbone.View.extend({
		
		el : $('#zeega-items-list'),
	
		initialize : function()
		{
			this.collection = new Browser.Items.Collection();
			this.collection.on( 'reset', this.reset, this);
			this._childViews = [];
			this._collectionChildViews = [];
			$('#spinner').spin('large');

			jda.app.isLoading = true;
		},
	
		render : function()
		{
			var _this = this;

			_this._isRendered = true;
			if(jda.app.currentView == 'thumb'){
				this.el = '#zeega-items-thumbnails';
			} else {
				this.el = '#zeega-items-list';
			}
			
			//Display collections and items separately if this is not null
			if (this.collection.collectionsCollection != null){
				
				$("#zeega-results-count").hide();

				var collectionsCount = this.collection.collectionsCount;
				var itemsCount = this.collection.count;
				
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				console.log(this.collection);
				console.log(itemsCount);
				
				$('.jda-results-collections-count').text( jda.app.addCommas(collectionsCount));
				$('.jda-results-items-count').text( jda.app.addCommas(itemsCount));

				if(jda.app.currentView == 'thumb'){
					$('.collections-thumbnails').empty();
				}else if(jda.app.currentView == 'list'){
					$('#zeega-collections-list').empty();
					
				}
				//this is getting ridiculous!!
				_.each( _.toArray(this.collection.collectionsCollection), function(item){
					var itemView;
					if(jda.app.currentView == 'thumb'){
						itemView = new Browser.Items.Views.Thumb({model:item});
						$('.collections-thumbnails').append( itemView.render().el );
						
					} else{
						
						itemView = new Browser.Items.Views.List({model:item});
						$('#zeega-collections-list').append( itemView.render().el );
					}
					
					_this._collectionChildViews.push( itemView );
					
				})

				$('.jda-separate-collections-and-items').show();
				if (this.collection.collectionsCollection.length ==0){
					$('.jda-separate-collections-and-items').find('.jda-results-collections-text').hide();
				}
				
			} else {
				$('#zeega-results-count-number').text(this.collection.count); 
				$("#zeega-results-count").fadeTo(100,1);
			}
			
			//Display regular old items
			_.each( _.toArray(this.collection), function(item){
				var itemView;
				if(jda.app.currentView == 'thumb'){
					itemView = new Browser.Items.Views.Thumb({model:item});
				} else{
					
					itemView = new Browser.Items.Views.List({model:item});
				}
				
				_this._childViews.push( itemView );
				$(_this.el).append( itemView.render().el );
			})

			
			

			$('#spinner').spin(false);
			
			//this is kind of a hack - give all thumbnails same height
			//to fix floaty issues
			if(jda.app.currentView == 'thumb'){
				$(this.el).find('li').css('height','170px');
			} 



			$(this.el).show();
			jda.app.isLoading = false;
	
		
			console.log("WANNA LOAD tags",this.collection.tags);
			if (!_.isUndefined(this.collection.tags) && this.collection.tags.length > 0 && jda.app.currentView != 'event')
			{
				console.log("LOADING tags",this.tags)
				$("#jda-related-tags button").remove();
				_.each( _.toArray(this.collection.tags), function(tag){

					var tagHTML ='<button class="btn btn-mini btn-danger">'+tag.name+'</button> ';
					
					$("#jda-related-tags").append(tagHTML);
					$("#jda-related-tags button").filter(":last").click(function(){
						
						//clear all current search filters
						jda.app.clearSearchFilters();

						//add only tag filter
						VisualSearch.searchBox.addFacet('tag', tag.name, 0);
						


						jda.app.search({ page:1,});
						return false;
					});
				})
				
				$("#jda-related-tags-title").fadeTo(100,1);
			}
			else
			{
				$("#jda-related-tags-title").fadeTo(1000,0);
			}
			
					return this;
		},
		
	
		
		renderTags : function()
		{
		},
		
		reset : function()
		{
			if ( this._isRendered )
			{
				$(this.el).empty();
				this._childViews = [];
				//this.render();
			}
		},
		
		search : function(obj,reset)
		{
			var _this = this;
			
			this.updated = true;
			
			$("#zeega-results-count").fadeTo(1000,0.5);

			$("#related-tags-title:visible").fadeTo(1000,0.5);
			//$(this.el).fadeTo(1000,0.5);
			jda.app.isLoading = true;
			if (obj.page == 1) $(this.el).hide();

			$('#spinner').spin('large');

			this.collection.setSearch(obj,reset);
			this.setURLHash();
			
			// fetch search collection for the list/thumb view
			this.collection.fetch({
				add : (obj.page) > 1 ? true : false,
				success : function(model, response)
				{ 
					
					//deselect/unfocus last tag - temp fix till figure out why tag is popping up autocomplete
					VisualSearch.searchBox.disableFacets();

					$('#zeega-results-count-number').html( jda.app.addCommas(response["items_count"]));
					
					
					
					_this.renderTags(response.tags);
					_this.render();
					
					//If this was a collection search then load the collection view which
					//appears above search results
					if (!_.isUndefined(_this.collectionFilter) && _this.collectionFilter != null){
						
						_this.collectionFilter.render();
					}
					//If this was a user search then load the user view which
					//appears above search results
					if (!_.isUndefined(_this.userFilter) && _this.userFilter != null){
						
						_this.userFilter.render();
					}

					
					
					
					if(_this.collection.length<parseInt(response["items_count"])) jda.app.killScroll = false; //to activate infinite scroll again
					else jda.app.killScroll = true;
					
					jda.app.isLoading = false;	//to activate infinite scroll again
				},
				error : function(model, response){
					console.log('Search failed - model is ' + model);
				}
			});
			
			
			
		},
		
		
		setMapBounds : function(bounds)
		{
			this.collection.search.mapBounds = bounds;
			this.setURLHash();
		},
	 
		setView : function(view)
		{
			this.collection.search.viewType = view;	
			this.setURLHash();
		},
	
		setContent : function(content)
		{
			this.collection.search.content = content;
			this.setURLHash();
		},
		
		setURLHash : function()
		{
			var obj = this.collection.search;
		 	var hash = '';      
		 	if( !_.isUndefined(obj.viewType)) hash += 'view_type=' + obj.viewType + '&';
		 	if( !_.isUndefined(obj.q) && obj.q.length > 0) hash += 'q=' + obj.q + '&';
		 	if( !_.isUndefined(obj.collection) && obj.collection > 0) hash += 'collection=' + obj.collection + '&';
		 	if( !_.isUndefined(obj.user) && obj.user > 0) hash += 'user=' + obj.user + '&';
		 	if( !_.isUndefined(obj.content) )  hash += 'content='+ obj.content + '&';
		 	if( !_.isUndefined(obj.mapBounds) )  hash += 'map_bounds='+ encodeURIComponent(obj.mapBounds) + '&';
		 	if( !_.isUndefined(obj.username) && obj.username.length > 0)  hash += 'username='+ encodeURIComponent(obj.username) + '&';
		 	if( !_.isUndefined(obj.times) )
			{
		 		if( !_.isUndefined(obj.times.start) ) hash += 'min_date='+ obj.times.start + '&';
		 		if( !_.isUndefined(obj.times.end) ) hash += 'max_date='+ obj.times.end + '&';
			}  
	
	 		jda.app.router.navigate(hash,{trigger:false});
	
		},
		

		setStartAndEndTimes : function(startDate, endDate)
		{
			var search = this.collection.search;
			search.times = {};
			search.times.start = startDate;
			search.times.end = endDate;
			this.setURLHash()
		},
		
		getCQLSearchString : function()
		{
		
			var search = this.collection.search;
		
			var cqlFilters = [];
			if( !_.isUndefined(search.times) )
			{
				if( !_.isUndefined(search.times.start) )
				{
					startDate = new Date(search.times.start*1000);
					startString = startDate.format('yyyy-mm-dd HH:MM:ss');
					cqlFilters.push("media_date_created >= '" + startString +"'");
				}
				if( !_.isUndefined(search.times.start) )
				{
					endDate = new Date(search.times.end*1000);
					endString = endDate.format('yyyy-mm-dd HH:MM:ss');
					cqlFilters.push("media_date_created <= '" + endString +"'");
				}	
			}

			//Tags and Texts are stored in the q property
			if( !_.isUndefined(search.q) )
			{
				var text = search.q;
				if(text)
				{
					if(cqlFilters.length > 0)
					{
						var newCqlFilters = [];
						var prevCqlFiltersString = cqlFilters.join(" AND ");
						newCqlFilters.push(prevCqlFiltersString + " AND (title LIKE '%"+text+"%' OR " + prevCqlFiltersString + " AND media_creator_username LIKE '%"+text+"%' OR " + prevCqlFiltersString + " AND description LIKE '%"+text+"%')");
						
						cqlFilters = newCqlFilters;
					}
					else
					{
						console.log("map search");
						cqlFilters.push("(title LIKE '%"+text+"%' OR media_creator_username LIKE '%"+text+"%' OR description LIKE '%"+text+"%')");
					}
				}
			}
			if( !_.isUndefined(search.content)&&search.content!="all" )
			{  
				var capitalizedContent =  search.content.charAt(0).toUpperCase() + search.content.slice(1);
				cqlFilters.push("media_type='" + capitalizedContent + "'");
			}
			if (cqlFilters.length>0)
			{
				cqlFilterString = cqlFilters.join(" AND ");
			}
			else
			{
				cqlFilterString = null;
			}
			console.log("CQL filter string " + cqlFilterString);
			return cqlFilterString;
		},
	
		
		getSearch : function(){ return this.collection.search },
		
		//Formats returned results number
		addCommas : function(nStr)
		{
			nStr += '';
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1))
			{
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		}
		
	});

})(jda.module("browser"));