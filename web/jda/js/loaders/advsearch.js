/********************************************

	MAIN.JS
	
	VERSION 0.1
	
	LOADS JS FILES


*********************************************/

var loadFiles = [
	
	//libraries	
	//'text!../app/views/items/templates.html',
	
	
	'order!../lib/jquery/jquery-1.7.1.min',
	'order!../lib/underscore/underscore-min',
	'order!../lib/backbone/backbone-0.9.1',
	'order!../lib/jquery-easing/jquery.easing.1.3',
	'order!../lib/jquerySVG/jquery.svg',
	'order!../lib/jquery-ui-1.8.18.custom/js/jquery-ui-1.8.18.custom.min',
	'order!../lib/spin',
	'order!../lib/spin-jquery',
	'order!../lib/date.format',

	'order!../lib/bootstrap',
	'order!../lib/leaflet/leaflet',
	
	'order!../lib/jquery.tagsinput.min',
	'order!../lib/jeditable.min',
	'order!../lib/dateformat/date.format',
	//mvc
	'order!../app/jda',
	
	//plugins

	//models
	'order!../app/models/items',
	'order!../app/models/tag',
	
	//collections
	'order!../app/collections/items',
	
	//views
	
	'order!../app/index',

	//custom
	'order!../helpers/utils',


		
	//core
	
	//'order!search',

	
	];

var contentTypes = ['Video','Audio','Image','Website','Tweet','Document'];


require(loadFiles, function(){
	
});

