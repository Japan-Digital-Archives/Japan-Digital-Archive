(function(Browser) {
    Browser.Items = Browser.Items ||{};
    Browser.Items.Collection = Backbone.Collection.extend({

        model:Browser.Items.Model,
        base : jda.app.apiLocation + 'api/items/search?',
        search : {  page:1
                },

        url : function()
        {
            //constructs the search URL
            var url = this.base;
            console.log(this.search);
            if( !_.isUndefined(this.search.q) && this.search.q.length > 0) url += '&q=' + this.search.q.toString();
            if( !_.isUndefined(this.search.nq) ) url += '&nq=' + this.search.nq;
            if( !_.isUndefined(this.search.tags) && this.search.tags.length > 0) url += '&tags=' + this.search.tags.toString();
            if( !_.isUndefined(this.search.viewType) ) url += '&view_type=' + this.search.viewType;
            if( !_.isUndefined(this.search.media_type) && this.search.media_type !== "") url += '&type=' + this.search.media_type;
            if( !_.isUndefined(this.search.sort) ) url += '&sort=' + this.search.sort;
            if( !_.isUndefined(this.search.itemId) && this.search.itemId > 0) url += '&collection=' + this.search.itemId;
            if( !_.isUndefined(this.search.page) ) url += '&page=' + this.search.page;
            if( !_.isUndefined(this.search.published) ) url += '&published=' + this.search.published;
            if( !_.isUndefined(this.search.data_source) ) url += '&data_source=' + this.search.data_source;
            if( !_.isUndefined(this.search.times)&&!_.isNull(this.search.times) ){
                if( !_.isUndefined(this.search.times.start) ) url += '&media_since=' + this.search.times.start;
                if( !_.isUndefined(this.search.times.end) ) url += '&media_before=' + this.search.times.end;
            }
            if( !_.isUndefined(this.search.user) && this.search.user>=-1&& this.search.user!=="") url += '&user=' + this.search.user;
            if(jda.app.currentView=='event') url+='&geo_located=1';
            console.log(url);
            return url;
        },

        setSearch : function(obj, reset)
        {
            if(reset){
                this.search = { page:1, published:1 };
                if(_.isNumber(obj.collection)||_.isNumber(obj.user)) {
                    this.search.media_type="-Collection";
                }
                if(_.isNumber(obj.user)) {
                    this.search.media_type="Collection";
                    this.search.data_source="db";
                }
                if(!_.isUndefined(obj.itemId) || jda.app.currentView=='event') {
                    this.search.published=undefined;
                }
                if(!_.isUndefined(obj.itemId) && _.isUndefined(obj.q)) {
                    this.search.data_source="db";
                }
            }

            _.extend(this.search,obj);
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
        }
    });


    Browser.Items.MapCollection = Backbone.Collection.extend({

        model:Browser.Items.Model,
        base : sessionStorage.getItem("geoServerUrl"),
        initialize : function(models,options){
            _.extend(this,options);

        },
        url : function()
        {
            return this.base+'getFeatureInfo&SQL='+this.SQL;

        },

        parse : function(response)
        {
            if(!_.isNull(response)){
                return response.results.splice(0,Math.max(response.results.length,50));
            }
            else{
                return [];
            }

        }
    });

    Browser.Router = Backbone.Router.extend({ /* ... */ });


})(jda.module("browser"));
