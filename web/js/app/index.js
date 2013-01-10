jQuery(function($)
{

	var JDA = jda.app;

	// Shorthand the application namespace
	//http://documentcloud.github.com/visualsearch/
	VisualSearch = VS.init({
		container : $('.visual_search'),
		query     : '',
		callbacks : {

			loaded	: function(){},

			search : function(){
					JDA.parseSearchUI();
			},

			clearSearch : JDA.clearSearchFilters,
			// These are the facets that will be autocompleted in an empty input.
			facetMatches : function(callback)
			{
				callback([
					'tag', 'text'  //, 'data:time & place','collection','user'
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
					case 'text':
						callback([]);
						break;

				}
			}
		} //callbacks
	});

	
	JDA.init();
	



});