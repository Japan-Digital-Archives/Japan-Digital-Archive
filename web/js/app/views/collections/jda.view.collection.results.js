(function(Browser) {
		Browser.Items = Browser.Items || {};
		Browser.Items.Collections = Browser.Items.Collections || {};
		Browser.Items.Collections.Views =  Browser.Items.Collections.Views || {};
	
	Browser.Items.Collections.Views.Results = Backbone.View.extend({
		
		el : $('#zeega-items-list'),
	
		initialize : function(){
			this.collection = new Browser.Items.Collection();
			this.collection.on( 'reset', this.reset, this);
			this._childViews = [];
			this._collectionChildViews = [];
			$('#spinner').spin('large');

			jda.app.isLoading = true;

			this.collection.bind('remove', this.remove, this);
			
			
		},
		
		remove : function(model){
			var deleteIdx = -1;
			for (var i=0;i<this._childViews.length;i++){
				var itemView = this._childViews[i];
				if (itemView.model.id == model.id){
					deleteIdx = i;
					break;
				}
			}

			if (deleteIdx >= 0){
				var removed = this._childViews.splice(deleteIdx,1);
				$(this.el).find(removed[0].el).remove();

				this.updateResultsCounts();
				this.updated = true;
				
			}

		},
		removeCollection : function(model){
			var deleteIdx = -1;
			for (var i=0;i<this._collectionChildViews.length;i++){
				var itemView = this._collectionChildViews[i];
				if (itemView.model.id == model.id){
					deleteIdx = i;
					break;
				}
			}

			if (deleteIdx >= 0){
				var removed = this._collectionChildViews.splice(deleteIdx,1);
				$(removed[0].el).remove();

				this.updateResultsCounts();
				this.updated = true;
				
			}

		},
		
		updateResultsCounts : function(){
			var collectionsCount = 0;
			if (this.collection.collectionsCollection){
				collectionsCount = this.collection.collectionsCollection.length;
			}
			var itemsCount = this.collection.count;

			if (collectionsCount !==null){
				$('.jda-results-collections-count').text( this.addCommas(collectionsCount));
			}
			$('.jda-results-items-count').text( this.addCommas(itemsCount));
			$("#zeega-results-count-number").html( this.addCommas(itemsCount) );
		},
		
		render : function(){
			var _this = this;
			$("#zeega-results-count").hide();
			
			_this._isRendered = true;
			if(jda.app.currentView == 'thumb'){
				this.el = '#zeega-items-thumbnails';
			} else {
				this.el = '#zeega-items-list';
			}
			
			//Display collections and items separately if this is not null
			if (!_.isUndefined(this.collection.collectionsCollection)){
				this.collection.collectionsCollection.unbind().bind('remove', this.removeCollection, this);

				if(jda.app.currentView == 'thumb') $('.collections-thumbnails').empty();
				else if(jda.app.currentView == 'list') $('#zeega-collections-list').empty();
				
				
				//Display collections
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
					
				});

				$('.jda-separate-collections-and-items').show();
				if (this.collection.collectionsCollection.length ===0){
					$('.jda-separate-collections-and-items').find('.jda-results-collections-text').hide();
				}
				
			} else {
				$('#zeega-results-count-number').text(this.addCommas(this.collection.count));
				$("#zeega-results-count").fadeTo(100,1);
			}
			
			//Display items
			
			var q =0;
			
			_.each( _.toArray(this.collection), function(item){
				q++;
				if(q>(_this.collection.search.page-1)*100){
					var itemView;
					if(jda.app.currentView == 'thumb'){
						itemView = new Browser.Items.Views.Thumb({model:item});
					} else{
						
						itemView = new Browser.Items.Views.List({model:item});
					}
					
					_this._childViews.push( itemView );
					$(_this.el).append( itemView.render().el );
				}
			});
			

			
			
			//this is kind of a hack - give all thumbnails same height
			//to fix floaty issues
			if(jda.app.currentView == 'thumb'){
				$(this.el).find('li').css('height','170px');
			}


			this.updateResultsCounts();
			
			$(this.el).show();

			jda.app.isLoading = false;
	
		
			//Display related Tags
			
			if (!_.isUndefined(this.collection.tags) && this.collection.tags.length > 0 && jda.app.currentView != 'event'){
				$("#jda-related-tags button").remove();
				_.each( _.toArray(this.collection.tags), function(tag){

					var tagHTML ='<button class="btn btn-mini">'+tag.name+'</button> ';
					
					$("#jda-related-tags").append(tagHTML);
					$("#jda-related-tags button").filter(":last").click(function(){
						
						
						
						
						//clear all current search filters
						jda.app.clearSearchFilters(false);

						//add only tag filter
						VS.init.searchBox.addFacet('tag', tag.name, 0);
						


						jda.app.parseSearchUI();
						return false;
					});
				});
				
				$("#jda-related-tags-title").fadeTo(100,1);
			}
			else $("#jda-related-tags-title").fadeTo(1000,0);

			$('#spinner').spin(false);
			$('#spinner-text').fadeTo('slow',0);
			$('#jda-left').fadeTo('slow',1);
			return this;
		},
		
		renderTags : function(){
		},
		
		reset : function(){
			if ( this._isRendered )
			{
				$(this.el).empty();
				this._childViews = [];
				//this.render();
			}
		},
		
		search : function(obj,reset)
		{
		
			console.log("jda.app.resultsView.search",obj);
			var _this = this;
			
			this.updated = true;
			
			$("#zeega-results-count").fadeTo(1000,0.5);

			$("#related-tags-title:visible").fadeTo(1000,0.5);
			//$(this.el).fadeTo(1000,0.5);
			jda.app.isLoading = true;
			if (obj.page == 1) $(this.el).hide();

			$('#spinner').spin('large');

			this.collection.setSearch(obj,reset);
	
			
			// fetch search collection for the list/thumb view
			this.collection.fetch({
				add : (obj.page) > 1 ? true : false,
				success : function(model, response)
				{
					//deselect/unfocus last tag - temp fix till figure out why tag is popping up autocomplete
					
					VisualSearch.searchBox.disableFacets();

					$('#zeega-results-count-number').html( _this.addCommas(response["items_count"]));
					_this.renderTags(response.tags);
					_this.render();
					
					if(_this.collection.length<parseInt(response["items_count"],10)) jda.app.killScroll = false; //to activate infinite scroll again
					else jda.app.killScroll = true;
					$(_this.el).fadeTo(1000,1);
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
		},
	 

		setContent : function(content)
		{
			this.collection.search.media_type = content;

		},
		clearTags : function(){
			var currentQ = this.collection.search.q;
			if (currentQ.indexOf("tag:") >= 0){
				var newQ = currentQ.substring(0,currentQ.indexOf("tag:"));
				this.collection.search.q = newQ;

			}
		},

		setStartAndEndTimes : function(startDate, endDate)
		{
			var search = this.collection.search;
			search.times = {};
			search.times.start = startDate;
			search.times.end = endDate;

		},
		
		getSQLSearchString : function(lng,lat)
		{
			
			
			var search = this.collection.search,
				sqlFilters = [],
				text,
				dist;

			if( !_.isUndefined(search.times) &&!_.isNull(search.times))
			{
				if( !_.isUndefined(search.times.start) )
				{
					startDate = new Date(search.times.start*1000);
					startString = startDate.format('yyyy-mm-dd HH:MM:ss');
					sqlFilters.push("media_date_created > " + search.times.start);
				}
				if( !_.isUndefined(search.times.end) )
				{
					endDate = new Date(search.times.end*1000);
					endString = endDate.format('yyyy-mm-dd HH:MM:ss');
					sqlFilters.push("media_date_created < " + search.times.end);
				}
			}

			//Text stored in the q property
			if( !_.isUndefined(search.q) && search.q)
			{
				var textFilter="",
					textQueries;
				textQueries = search.q.split(" AND ");
				
				for(var i=0;i<textQueries.length;i++){
					textQueries[i]="full_text LIKE '"+textQueries[i]+"'";
				}
				
				textFilter = "("+textQueries.join(" AND ")+")";

				sqlFilters.push(textFilter);
			

			}

			
			if( !_.isUndefined(search.tags) && search.tags)
			{
				var tagFilter="",
					tagQueries;
				tagQueries = search.tags.split(" AND ");
				console.log(tagQueries.length);
				for(var j=0;j<tagQueries.length;j++){
					console.log(tagQueries[j]+"--");
					tagQueries[j]="tags LIKE '"+tagQueries[j]+"'";
					console.log(tagQueries[j]+"--");
				}
				console.log(tagQueries);
				tagFilter = "("+tagQueries.join(" AND ")+")";

				sqlFilters.push(tagFilter);
			}


			if(!_.isUndefined(search.media_type)&&search.media_type=="-Tweet" ){
			
				sqlFilters.push("media_type NOT LIKE 'Tweet'");
			
			}
			else if( !_.isUndefined(search.media_type)&&search.media_type!=="all" && search.media_type!== '')
			{
				sqlFilters.push("media_type LIKE '" + search.media_type + "'");
			}
			else
			{
				//sqlFilters.push("media_type LIKE ''");
			}
			if (sqlFilters.length>0)
			{
				sqlFilterstring = sqlFilters.join(" AND ");
			}
			else
			{
				sqlFilterstring = null;
			}
			console.log(sqlFilterstring);
			
			
			dist = this.getDist();


			if(lat&&lng){
				if(sqlFilterstring===null) {
					sqlFilterstring='select id, site_id, user_id, title, description, text, uri, thumbnail_url, attribution_uri, date_created, date_updated, archive, media_type, layer_type, child_items_count, media_geo_latitude, media_geo_longitude, media_date_created, media_date_created_end, media_creator_username, media_creator_realname, license, attributes, tags from jda where dist(point(media_geo_longitude,media_geo_latitude),point('+lng+','+lat+')) < '+dist+' LIMIT 50';
				} else {
					sqlFilterstring='select id, site_id, user_id, title, description, text, uri, thumbnail_url, attribution_uri, date_created, date_updated, archive, media_type, layer_type, child_items_count, media_geo_latitude, media_geo_longitude, media_date_created, media_date_created_end, media_creator_username, media_creator_realname, license, attributes, tags from jda where '+sqlFilterstring+' AND dist(point(media_geo_longitude,media_geo_latitude),point('+lng+','+lat+')) < '+dist+' LIMIT 50';
				}
			}
			else{
				if(sqlFilterstring===null)sqlFilterstring='select goog_x, goog_y from jda';
				else sqlFilterstring='select goog_x, goog_y from jda where '+sqlFilterstring;
			}
			
			console.log(search, "sqlstring: "+sqlFilterstring);
			return sqlFilterstring;
		},

		getDist:function(){

			var bounds,
				latLngBounds,
				dist;

			bounds = jda.app.eventMap.map.getExtent();
			latLngBounds = bounds.transform(jda.app.eventMap.map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));
			dist = 1000*Math.abs(latLngBounds.left-latLngBounds.right)/window.innerWidth;
			console.log("###########",bounds,latLngBounds,dist);
			return dist;
		},
	
		
		getSearch : function(){ return this.collection.search; },
		
		//Formats returned results number
		addCommas : function(nStr)
		{
			var rgx,
				x,
				x1,
				x2;

			nStr += '';
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			rgx = /(\d+)(\d{3})/;
			while ( rgx.test(x1) ) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}

			return x1 + x2;
		}
		
	});

})(jda.module("browser"));