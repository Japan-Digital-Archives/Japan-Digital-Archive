jQuery(function($)
{
	// Shorthand the application namespace
	//http://documentcloud.github.com/visualsearch/
	VisualSearch = VS.init({
		container : $('.visual_search'),
		query     : '',
		callbacks : {

			loaded	: function(){},

			search : function(){ 
					jda.app.parseSearchUI() 
				
			},

			clearSearch : jda.app.clearSearchFilters,
			// These are the facets that will be autocompleted in an empty input.
			facetMatches : function(callback)
			{
				callback([
					'tag', 'keyword', 'text'  //, 'data:time & place','collection','user'
				]);
			},
			// These are the values that match specific categories, autocompleted
			// in a category's input field.  searchTerm can be used to filter the
			// list on the server-side, prior to providing a list to the widget.
			valueMatches : function(facet, searchTerm, callback)
			{
				switch (facet)
				{

					case 'tag':
						callback([]);
						break;
					case 'keyword':
						callback([]);
						break;
					case 'text':
						callback([]);
						break;

				}
			}
		} //callbacks
	});

	var JDA = jda.app;
	JDA.init();


	// Defining the application router, you can attach sub routers here.
	var Router = Backbone.Router.extend({

		routes: {
			""				: 'search',
			":query"		: 'search',

		},

		search : function( query ){
					JDA.parseURLHash(query);
				}
		});

	JDA.router = new Router();
	Backbone.history.start();

});