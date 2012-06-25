(function(Browser) {
	Browser.Items = Browser.Items ||{};	
	Browser.Items.Collection = Backbone.Collection.extend({
		
		model:Browser.Items.Model,
		base : jda.app.apiLocation + 'api/search?',
		search : {	page:1,
					r_itemswithcollections: 0,
					r_items:1,
					r_tags:1

				},
	
		url : function()
		{
			console.log(this.search);
			console.log(this.search.username);
			//constructs the search URL
			var url = this.base;
			if( !_.isUndefined(this.search.q) && this.search.q.length > 0) url += '&q=' + this.search.q.toString();
			if( !_.isUndefined(this.search.viewType) ) url += '&view_type=' + this.search.viewType;
			if( !_.isUndefined(this.search.content) ) url += '&content=' + this.search.content;
			if( !_.isUndefined(this.search.collection) && this.search.collection > 0) url += '&collection=' + this.search.collection;
			if( !_.isUndefined(this.search.page) ) url += '&page=' + this.search.page;
			if( !_.isUndefined(this.search.r_items) ) url += '&r_items=' + this.search.r_items;
			if( !_.isUndefined(this.search.r_tags)) url += '&r_tags=' + this.search.r_tags;
			if( !_.isUndefined(this.search.r_itemswithcollections) ) url += '&r_itemswithcollections=' + this.search.r_itemswithcollections;
			if( !_.isUndefined(this.search.r_collections) ) url += '&r_collections=' + this.search.r_collections;
			if( !_.isUndefined(this.search.times) ){
			    if( !_.isUndefined(this.search.times.start) ) url += '&min_date=' + this.search.times.start;
			    if( !_.isUndefined(this.search.times.end) ) url += '&max_date=' + this.search.times.end;
	     	};
	     	if( !_.isUndefined(this.search.user) && this.search.user>=-1&& this.search.user!="") url += '&user=' + this.search.user;
	     	if( !_.isUndefined(this.search.username) && this.search.username.length > 0) url += '&username=' + this.search.username;
	     	if(jda.app.currentView=='event') url+='&geo_located=1';
	    
			console.log('search url: '+ url);
			return url;
		},
	
		setSearch : function(obj, reset)
		{
			if(reset) this.search = obj;
			else _.extend(this.search,obj)
			console.log('set search: ',obj)
		},
		
		getSearch : function()
		{
			return this.search;
		},
	
		parse : function(response)
		{
			if (this.search.r_collections && response.collections){
				this.collectionsCollection = new Browser.Items.Collection(response.collections);
			}else{
				this.collectionsCollection = null;
			}
			return response.items;
			
		},
		
	
	});

	Browser.Router = Backbone.Router.extend({ /* ... */ });


})(jda.module("browser"));
