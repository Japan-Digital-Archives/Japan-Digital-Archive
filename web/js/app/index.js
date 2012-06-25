jQuery(function($)
{
	// Shorthand the application namespace
	//http://documentcloud.github.com/visualsearch/
	VisualSearch = VS.init({
		container : $('.visual_search'),
		query     : '',
		callbacks : {

			loaded	: function(){},

			search : function(){ jda.app.search( {page:1} ) },

			clearSearch : jda.app.clearSearchFilters,
			// These are the facets that will be autocompleted in an empty input.
			facetMatches : function(callback)
			{
				callback([
					'tag', 'keyword', 'text', 'data:time & place','collection','user'
				]);
			},
			// These are the values that match specific categories, autocompleted
			// in a category's input field.  searchTerm can be used to filter the
			// list on the server-side, prior to providing a list to the widget.
			valueMatches : function(facet, searchTerm, callback)
			{
				switch (facet)
				{
					case 'user':
						callback([]);
						break;
					case 'tag':
						callback([]);
						break;
					case 'keyword':
						callback([]);
						break;
					case 'text':
						callback([]);
						break;
					case 'data:time & place':
						callback([]);
						break;
				}
			}
		} //callbacks
	});

	var JDA = jda.app;
	JDA.init();
	//jda.app.init();

	// Defining the application router, you can attach sub routers here.
	var Router = Backbone.Router.extend({

		routes: {
			""				: 'search',
			":query"		: "search",

		},

		search : function( query )
				{

					var obj = '{page:1}';
					if (!_.isUndefined(query))
					{
						obj = QueryStringToHash(query);
					}

					//parse time slider properties
					obj.times = {};
					if (obj.min_date != null){
						obj.times.start = obj.min_date;
					}
					if (obj.max_date != null){
						obj.times.end = obj.max_date;
					}


					//If URL specifies particular collection then we gotta look it up and set it in the app
					//Only then can we update search UI with the title of the collection as a facet
					if (obj.collection != null && obj.collection > 0){
						var Browser = jda.module("browser");
						var collectionModel = new Browser.Items.Model({id:obj.collection});

						collectionModel.fetch(
						{
							success : function(model, response)
							{ 
								JDA.addFilter(model,'collection',obj);
							},
							error : function(model, response)
							{ 
								console.log('index.js: Error getting collection specified in URL');
							}
						});

					} 
					else if (obj.user != null && obj.user >= -1){
						var Browser = jda.module("browser");

						//retrieve user object and then add user filter
						var authorModel = new Browser.Users.Model({id:obj.user});
						authorModel.fetch({
							success : function(model, response){
								JDA.addFilter(model,'user',obj);
							},
							error : function(model, response){
								console.log('index.js: Error getting user specified in URL');
							},

						});
					}
					else {
						JDA.search(obj, true);
					}
				}


			});
			var QueryStringToHash = function QueryStringToHash  (query) {
			  var query_string = {};
			  var vars = query.split("&");
			  for (var i=0;i<vars.length;i++) {
			    var pair = vars[i].split("=");
			    pair[0] = decodeURIComponent(pair[0]);
			    pair[1] = decodeURIComponent(pair[1]);
			        // If first entry with this name
			    if (typeof query_string[pair[0]] === "undefined") {
			      query_string[pair[0]] = pair[1];
			        // If second entry with this name
			    } else if (typeof query_string[pair[0]] === "string") {
			      var arr = [ query_string[pair[0]], pair[1] ];
			      query_string[pair[0]] = arr;
			        // If third or later entry with this name
			    } else {
			      query_string[pair[0]].push(pair[1]);
			    }
			  } 
			  return query_string;
			};

			JDA.router = new Router();
			Backbone.history.start();

		});