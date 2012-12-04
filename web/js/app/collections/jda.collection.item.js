(function(Browser) {
	Browser.Items = Browser.Items ||{};	
	Browser.Items.Collection = Backbone.Collection.extend({
		
		model:Browser.Items.Model,
		base : jda.app.apiLocation + 'api/items/search?',
		search : {	page:1,
					r_itemswithcollections: 1,
					r_tags:1

				},
	
		url : function()
		{
			//constructs the search URL
			var url = this.base;
			if( !_.isUndefined(this.search.q) && this.search.q.length > 0) url += '&q=' + this.search.q.toString();
			if( !_.isUndefined(this.search.viewType) ) url += '&view_type=' + this.search.viewType;
			if( !_.isUndefined(this.search.media_type) && this.search.media_type != "") url += '&type=' + this.search.media_type;
			if( !_.isUndefined(this.search.sort) ) url += '&sort=' + this.search.sort;
			if( !_.isUndefined(this.search.itemId) && this.search.itemId > 0) url += '&collection=' + this.search.itemId;
			if( !_.isUndefined(this.search.page) ) url += '&page=' + this.search.page;
			if( !_.isUndefined(this.search.times)&&!_.isNull(this.search.times) ){
			    if( !_.isUndefined(this.search.times.start) ) url += '&min_date=' + this.search.times.start;
			    if( !_.isUndefined(this.search.times.end) ) url += '&max_date=' + this.search.times.end;
	     	};
	     	if( !_.isUndefined(this.search.user) && this.search.user>=-1&& this.search.user!="") url += '&user=' + this.search.user;
	     	//if( !_.isUndefined(this.search.username) &&  !_.isNull(this.search.username) &this.search.username.length > 0) url += '&username=' + this.search.username;
	     	if(jda.app.currentView=='event') url+='&geo_located=1';
			return url;
		},
	
		setSearch : function(obj, reset)
		{
			if(reset){
				this.search = { r_tags:1,page:1, r_items:1 };
				if(_.isNumber(obj.collection)||_.isNumber(obj.user))this.search.r_itemswithcollections=0;
				else this.search.r_itemswithcollections=1;
				if(_.isNumber(obj.user)) this.search.r_collections=1;
			}
			
			_.extend(this.search,obj)
			
			
			if(jda.app.currentView=="event") console.log("Range slider values",$("#range-slider").slider( "option", "values" ));
		},
		
		getSearch : function()
		{
			return this.search;
		},
	
		parse : function(response)
		{
		
			this.tags=response.tags;
			this.count = response.items_count;
			return response.items;
		},
		
	
	});
	
	
	Browser.Items.MapCollection = Backbone.Collection.extend({
		
		model:Browser.Items.Model,
		base : 'http://140.247.116.252:8083/',
		initialize : function(models,options){
			_.extend(this,options);
		
		},
		url : function()
		{
			return this.base+'getFeatureInfo&SQL='+this.SQL;
		
		},
	
		parse : function(response)
		{
			return response.results.splice(0,Math.max(response.results.length,50));
		},
		
	
	});

	Browser.Router = Backbone.Router.extend({ /* ... */ });


})(jda.module("browser"));
