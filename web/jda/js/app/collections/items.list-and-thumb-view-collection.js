(function(Items) {

Items.ViewCollection = Backbone.View.extend({
		el : $('#zeega-items-list'),
	
		initialize : function()
		{
			this.collection = new Items.Collection();
			this.collection.on( 'reset', this.reset, this);
			this._childViews = [];
			$('#spinner').spin('large');

			jda.app.isLoading = true;
		},
	
		render : function()
		{
			var _this = this;

			_this._isRendered = true;
			if(jda.app.currentView == 'thumb'){
				this.el = '.thumbnails';
			} else {
				this.el = '#zeega-items-list';
			}
			_.each( _.toArray(this.collection), function(item){
				var itemView;
				if(jda.app.currentView == 'thumb'){
					itemView = new Items.Views.Thumb({model:item});
				} else{
					
					itemView = new Items.Views.List({model:item});
				}
				
				_this._childViews.push( itemView );
				$(_this.el).append( itemView.render().el );
			})

			
			//$(this.el).fadeTo(100,1);
			$("#zeega-results-count").fadeTo(100,1);

			$('#spinner').spin(false);
			
			$(this.el).show();
			jda.app.isLoading = false;
			return this;
		},
		
		renderTags : function(tags)
		{
			
			if (tags.length > 0 && jda.app.currentView != 'event')
			{
				$("#jda-related-tags button").remove();
				_.each( _.toArray(tags), function(tag){

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
				
				$("#jda-related-tags, #jda-related-tags-title").fadeTo(100,1);
			}
			else
			{
				if ($("#jda-related-tags-title").is(":visible")){$("#jda-related-tags-title").fadeTo(1000,0);}
			}
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

			$("#related-tags:visible, #related-tags-title:visible").fadeTo(1000,0.5);
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
					
					
					if(_this.collection.length<parseInt(response["items_count"])) jda.app.killScroll = false; //to activate infinite scroll again
					else jda.app.killScroll = true;
					
					jda.app.isLoading = false;	//to activate infinite scroll again
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
			obj = this.collection.search;
		 	var hash = '';      
		 	if( !_.isUndefined(obj.viewType)) hash += 'view_type=' + obj.viewType + '&';
		 	if( !_.isUndefined(obj.q) && obj.q.length > 0) hash += 'q=' + obj.q + '&';
		 	if( !_.isUndefined(obj.collection) && obj.collection.length > 0) hash += 'collection=' + obj.collection + '&';
		 	if( !_.isUndefined(obj.content) )  hash += 'content='+ obj.content + '&';
		 	if( !_.isUndefined(obj.mapBounds) )  hash += 'map_bounds='+ encodeURIComponent(obj.mapBounds) + '&';
		 	if( !_.isUndefined(obj.times) )
			{
		 		if( !_.isUndefined(obj.times.start) ) hash += 'start='+ obj.times.start + '&';
		 		if( !_.isUndefined(obj.times.end) ) hash += 'end='+ obj.times.end + '&';
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
				/*
				var tags = jda.app.getTagNamesFromSearchQuery(search.q);
				_(tags).each(function(tag){
					cqlFilters.push("tags='" + tag + "'");
				});
				*/
				var text = search.q;
				if(text)
				{
					if(cqlFilters.length > 0)
					{
						var newCqlFilters = [];
						var prevCqlFiltersString = cqlFilters.join(" AND ");
						newCqlFilters.push(prevCqlFiltersString + " AND title LIKE '%"+text+"%' OR " + prevCqlFiltersString + " AND media_creator_username LIKE '%"+text+"%' OR " + prevCqlFiltersString + " AND description LIKE '%"+text+"%'");
						
						cqlFilters = newCqlFilters;
					}
					else
					{
						console.log("map search");
						cqlFilters.push("title LIKE '%"+text+"%' OR media_creator_username LIKE '%"+text+"%' OR description LIKE '%"+text+"%'");
					}
				}
			}
			/*if( !_.isUndefined(search.tags) )
			{
				cqlFilters.push("tags='" + search.tags + "'");
			}*/
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

})(jda.module("items"));