//Adds a function to the javascript date object.
//Didn't really know where to put this so I put it here...(Catherine)
Date.prototype.getMonthAbbreviation = function() {
   return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][this.getMonth()]; 
}

this.zeegaWidget = {
	// break up logical components of code into modules.
	module: function()
	{
		// Internal module cache.
		var modules = {};

		// Create a new module reference scaffold or load an existing module.
		return function(name) 
		{
			// If this module has already been created, return it.
			if (modules[name]) return modules[name];

			// Create a module and save it under this name
			return modules[name] = { Views: {} };
		};
	}(),

  // Keep active application instances namespaced under an app object.
	app: _.extend({
	
		myCollections : null,
		myCollectionsView : null,
		search : null, 
		searchItemsView : null,
		searchCollectionsView : null,

		init : function()
		{
			var Items = zeegaWidget.module('items');
			//this.items = new Items.MasterCollection();
			var itemBS = jQuery.parseJSON(itemJSON);
			var newItem = new Items.Model( itemBS );
			var newItemView = new Items.Views.Ingesting({ model : newItem } )
			newItemView.render();
		}

	}, Backbone.Events)

};

jQuery(function($)
{

//	var widget = zeegaWidget.app;
	
	
	
//	widget.init();
	var collections;
	console.log(sessionStorage);
	
	
	$.get(sessionStorage.apiUrl+"api/items/search?q=type:Collection&user="+sessionStorage.user+"&data_source=db", function(data) {
    	$.each(data.items, function(i, val) {
    		$("#widget-collection").append("<option value='"+val.id+"'>"+val.title+"</option>");

    	});
    });

});