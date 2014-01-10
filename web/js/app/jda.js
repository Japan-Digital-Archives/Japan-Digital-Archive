
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

        this.startRouter();
        var _this=this;
    },
    initCollectionsDrawer:function(){
        //load my collections drawer
        var Browser = jda.module("browser");
        this.myCollectionsDrawer = new Browser.Items.Collections.Views.MyCollectionsDrawer();
        this.myCollectionsDrawer.getCollectionList();
    },
    startRouter: function()
    {
        var _this = this;
            // Defining the application router, you can attach sub routers here.
        var Router = Backbone.Router.extend({
            routes: {
                ""                : 'search',
                ":query"        : 'search'
            },

            search : function( query ){
                _this.parseURLHash(query);
            }
        });

        this.router = new Router();
        Backbone.history.start();
    },
    queryStringToHash: function (query) {
        var query_obj = {};
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            pair[0] = decodeURIComponent(pair[0]);
            pair[1] = decodeURIComponent(pair[1]);
            // If first entry with this name
            if (typeof query_obj[pair[0]] === "undefined") {
                query_obj[pair[0]] = pair[1];
            // If second entry with this name
            } else if (typeof query_obj[pair[0]] === "string") {
                var arr = [ query_obj[pair[0]], pair[1] ];
                query_obj[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_obj[pair[0]].push(pair[1]);
            }
        }

        //parse time slider properties
        query_obj.times = {};
        if (query_obj.min_date !== null){
        query_obj.times.start = query_obj.min_date;
        }
        if (query_obj.max_date !== null){
        query_obj.times.end = query_obj.max_date;
        }

        return query_obj;
    },

    parseURLHash  : function (query){

        var _this=this;
        var Browser = jda.module("browser");
        //Update Search Object

        if (!_.isUndefined(query)){
            this.searchObject =  this.queryStringToHash(query);
        } else {
            this.searchObject = {page:1};
        }

        console.log("searchObject",this.searchObject);
        //Update interface

        this.updateSearchUI(this.searchObject);

        //Load filter if nec, carry out search

        if(sessionStorage.getItem('filterType')=='none'||!_.isUndefined(this.filterModel)) {

            if (!_.isUndefined(this.searchObject.view_type)) this.switchViewTo(this.searchObject.view_type,true) ;
            else this.search(this.searchObject);
        }
        else{

            $('.tab-content').find('.btn-group').hide();
            $('#jda-related-tags').hide();
            $('#event-button').hide();

            if(sessionStorage.getItem('filterType')=='user'){
                this.filterType ="user";
                this.filterModel = new Browser.Users.Model({id:sessionStorage.getItem('filterId')});
                this.filterModel.fetch({
                    success : function(model, response){
                                    _this.resultsView.userFilter = new Browser.Users.Views.UserPage({model:model});
                                    if (!_.isUndefined(_this.searchObject.view_type)) _this.switchViewTo(_this.searchObject.view_type,true) ;
                                    else _this.search(_this.searchObject);
                    },
                    error : function(model, response){
                        console.log('Failed to fetch the user object.');

                    }
                });
            }
            else if(sessionStorage.getItem('filterType')=='collection'){

                this.filterType ="collection";
                this.filterModel = new Browser.Items.Model({id:sessionStorage.getItem('filterId')});
                this.filterModel.fetch({
                    success : function(model, response){
                        _this.resultsView.collectionFilter = new Browser.Items.Views.CollectionPage({model:model});
                        if (!_.isUndefined(_this.searchObject.view_type)) _this.switchViewTo(_this.searchObject.view_type,true) ;
                        else _this.search(_this.searchObject);
                    },
                    error : function(model, response){
                        console.log('Failed to fetch the user object.');

                    }

                });

            }
        }
    },

    sort : function(){
        this.searchObject.sort = $('#zeega-sort').val();
        this.updateURLHash(this.searchObject);
        this.search(this.searchObject);
    },

    parseSearchUI : function(){
        var facets = VisualSearch.searchQuery.models;

        var obj={};
        var tagQuery = "";
        var textQuery = "";

        _.each( VisualSearch.searchBox.facetViews, function( facet ){

            if( facet.model.get('category') != 'tag' && facet.model.get('category') != 'text')
            {
                facet.model.set({'value': null });
                facet.remove();
            }
        });

        _.each(facets, function(facet){
            switch ( facet.get('category') )
            {
                case 'text':
                    textQuery = (textQuery.length > 0) ? textQuery + " AND " + facet.get('value') : facet.get('value');
                    textQuery=textQuery.replace(/^#/, '');
                    break;
                case 'tag':
                    tagQuery = (tagQuery.length > 0) ? tagQuery + " AND " + facet.get('value') : tagQuery + facet.get('value');
                    tagQuery=tagQuery.replace(/^#/, '');
                    break;
            }
        });

        obj.q = textQuery;
        obj.tags = tagQuery;
        obj.view_type = this.currentView;

        obj.media_type = $('#zeega-content-type').val();

        // remove retweets
        if ($("#noRTChk").is(":checked")) {
          obj.nq = "RT";
        }

        obj.sort = $('#zeega-sort').val();

        obj.times = this.searchObject.times;

        this.searchObject=obj;


        this.updateURLHash(obj);
        this.search(obj);

    },

    updateSearchUI : function(obj){


        VisualSearch.searchBox.disableFacets();
        VisualSearch.searchBox.value('');
        VisualSearch.searchBox.flags.allSelected = false;
        var tags, text;



        if (!_.isUndefined(obj.q)&&obj.q.length>0){
            text = obj.q.split(" AND ");
            for( var j=0; j<text.length; j++ ){
                VisualSearch.searchBox.addFacet('text', text[j], 0);
            }
        }

        //check for tags
        if (!_.isUndefined(obj.tags)&&obj.tags.length>0){
            tags = obj.tags.split(" AND ");
            for(var i=0;i<tags.length;i++)
            {

                VisualSearch.searchBox.addFacet('tag', tags[i], 0);
            }
        }


        if (!_.isUndefined(obj.media_type)) $('#zeega-content-type').val(obj.media_type);
        else $('#zeega-content-type').val("");


        if (!_.isUndefined(obj.sort)) $('#zeega-sort').val(obj.sort);
        else $('#zeega-sort').val("relevant");

        $('#select-wrap-text').text( $('#zeega-content-type option[value=\''+$('#zeega-content-type').val()+'\']').text() );


    },

    updateURLHash : function(obj){
		var hash = '';
        if( !_.isUndefined(this.viewType)) hash += 'view_type=' + this.viewType + '&';
        if( !_.isUndefined(obj.q) && obj.q.length > 0) hash += 'q=' + obj.q + '&';
        if( !_.isUndefined(obj.nq)) hash += 'nq=' + obj.nq + '&';
        if( !_.isUndefined(obj.tags) && obj.tags.length > 0) hash += 'tags=' + obj.tags + '&';
        if( !_.isUndefined(obj.media_type) )hash += 'media_type='+ obj.media_type + '&';
        if( !_.isUndefined(obj.media_after) )hash += 'media_after='+ obj.media_after + '&';
        if( !_.isUndefined(obj.media_before) )hash += 'media_before='+ obj.media_before + '&';

        if( !_.isUndefined(obj.sort) )  hash += 'sort='+ obj.sort + '&';
        if( !_.isUndefined(obj.mapBounds) )  hash += 'map_bounds='+ encodeURIComponent(obj.mapBounds) + '&';
        if( !_.isUndefined(obj.times)&&  !_.isNull(obj.times) )
        {
             if( !_.isUndefined(obj.times.start) ) hash += 'min_date='+ obj.times.start + '&';
             if( !_.isUndefined(obj.times.end) ) hash += 'max_date='+ obj.times.end + '&';
        }
        jda.app.router.navigate(hash,{trigger:false});
    },

    search : function(obj){
        if(!_.isUndefined(this.filterType)){
            if(this.filterType=="user"){
                obj.user= sessionStorage.getItem('filterId');
            }
            else if(this.filterType=="collection"){
                obj.itemId = sessionStorage.getItem('filterId');
            }
        }


        this.resultsView.search( obj,true );

        if (this.currentView == 'event') this.eventMap.load();

    },

    switchViewTo : function( view , refresh ){
        var _this=this;

        if( view != this.currentView&&(view=="event"||this.currentView=="event"))refresh = true;


        this.currentView = view;
        $('.tab-pane').removeClass('active');
        $('#zeega-'+view+'-view').addClass('active');


        switch( this.currentView )
        {
            case 'list':
                this.showListView(refresh);
                break;
            case 'event':
                this.showEventView(refresh);
                break;
            case 'thumb':
                this.showThumbnailView(refresh);
                break;
            default:
            console.log('view type not recognized');
        }

    },

    showListView : function(refresh){
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
            this.resultsView.render();
        }
        this.viewType='list';
        if(refresh){
            this.searchObject.times=null;
            this.search(this.searchObject);
        }
        this.updateURLHash(this.searchObject);

    },

    showThumbnailView : function(refresh){



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
            this.resultsView.render();
        }
        this.viewType='thumb';
        if(refresh){
            this.searchObject.times=null;
            this.search(this.searchObject);
        }
                this.updateURLHash(this.searchObject);
    },

    showEventView : function(refresh){
        $('#zeega-view-buttons .btn').removeClass('active');
        $('#event-button').addClass('active');

        $('#jda-right').hide();
        $('#event-time-slider').show();
        $('#zeega-results-count').addClass('zeega-results-count-event');
        $('#zeega-results-count').offset( { top:$('#zeega-results-count').offset().top, left:10 } );
        $('#zeega-results-count').css('z-index', 1000);

        $('#zeega-results-count-text-with-date').show();
        /*
        var removedFilters = "";
        var _this = this;
        _.each( VisualSearch.searchBox.facetViews, function( facet ){
            if( facet.model.get('category') == 'tag' || facet.model.get('category') == 'collection' ||
                facet.model.get('category') == 'user');
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

            }

        });
        if (removedFilters.length > 0){
            $('#removed-tag-name').text(removedFilters);
            $('#remove-tag-alert').show('slow');
            setTimeout(function() {
                $('#remove-tag-alert').hide('slow');
            }, 5000);
        }
        */

        $("#zeega-event-view").width($(window).width());

        //this is the hacky way to update the search count properly on the map
        $("#zeega-results-count").fadeTo(100,0);


        this.viewType='event';
        //this.parseSearchUI();
        this.updateURLHash(this.searchObject);
        this.search(this.searchObject);


    },

    setEventViewTimePlace : function(obj){
        this.eventMap.updateTimePlace(obj);
    },

    clearSearchFilters : function(doSearch){
        $('#zeega-content-type').val("all");
        $('#select-wrap-text').text( $('#zeega-content-type option[value=\''+$('#zeega-content-type').val()+'\']').text() );

        //remove search box values
        VisualSearch.searchBox.disableFacets();
        VisualSearch.searchBox.value('');
        VisualSearch.searchBox.flags.allSelected = false;
        if(doSearch) this.search({ page:1});
    },

    goToCollection: function (id){
        window.location=$('#zeega-main-content').data('collection-link')+"/"+id;

    },

    goToUser: function (id){
        window.location=$('#zeega-main-content').data('user-link')+"/"+id;

    },

    /***************************************************************************
        - called when user authentication has occured
    ***************************************************************************/

    userAuthenticated: function(){


        $('#zeega-my-collections-share-and-organize').html('Saving collection...');
        var _this=this;

        if(this.myCollectionsDrawer.activeCollection.get('new_items').length>0){
            this.myCollectionsDrawer.activeCollection.save({},{
                success:function(model,response){

                    _this.initCollectionsDrawer();
                }
            });
        }
        else this.initCollectionsDrawer();
    }
}, Backbone.Events)


};
