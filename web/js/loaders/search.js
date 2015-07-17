/********************************************

	MAIN.JS
	
	VERSION 0.1
	
	LOADS JS FILES


*********************************************/

require (
	[
	//data
	
	'order!../data/map-layers',
	
	
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
	'order!../lib/jquery-ui-timepicker-addon',
	'order!../lib/bootstrap-2.0.2/js/bootstrap.min',
	'order!../lib/ajaxfileuploader/ajaxfileupload',
	
	'order!../lib/jquery.tagsinput',
	'order!../lib/fancybox/jquery.easing-1.3.pack',
	'order!../lib/fancybox/jquery.mousewheel-3.0.6.pack',
	'order!../lib/fancybox/jquery.fancybox',
	
	'order!../lib/fancybox/helpers/jquery.fancybox-buttons',
	'order!../lib/jeditable.min',
	'order!../lib/dateformat/date.format',
	'order!../lib/visualsearch/visualsearch',
	'order!../lib/popcorn-flash',
	'order!../lib/wax.ol.min',
	//mvc
	'order!../app/jda',
	
	//plugins
	'order!../plugins/players/plyr',

	//models
	
	'order!../app/models/jda.model.user',
	'order!../app/models/jda.model.item',
	'order!../app/models/jda.model.tag',
	
	//collections
	'order!../app/collections/jda.collection.item',

	
	//views
	'order!../app/views/items/jda.view.item.collection-page',
	'order!../app/views/items/jda.view.item.waku-area',
	'order!../app/views/items/jda.view.item.list',
	'order!../app/views/items/jda.view.item.thumb',
	'order!../app/views/items/jda.view.item.map-popup',
	
	'order!../app/views/collections/jda.view.collection.results',
	'order!../app/views/collections/jda.view.collection.my-collections-drawer',
	'order!../app/views/collections/jda.view.collection.map-popup',


	'order!../app/views/jda.view.locator-map',
	'order!../app/views/jda.view.event-map',

	'order!../app/views/users/jda.view.user.user-page',
	
	'order!../app/views/modals/jda.view.modal.archive-settings',
	
	
	//fancybox
	
	'order!../app/views/fancybox/jda.view.fancybox._fancybox',
	'order!../app/views/fancybox/jda.view.fancybox.audio',
	'order!../app/views/fancybox/jda.view.fancybox.testimonial',
	'order!../app/views/fancybox/jda.view.fancybox.document-cloud',
	'order!../app/views/fancybox/jda.view.fancybox.image',
	'order!../app/views/fancybox/jda.view.fancybox.default',
	'order!../app/views/fancybox/jda.view.fancybox.tweet',
	'order!../app/views/fancybox/jda.view.fancybox.soundcloud',
	'order!../app/views/fancybox/jda.view.fancybox.video',
	'order!../app/views/fancybox/jda.view.fancybox.website',
	'order!../app/views/fancybox/jda.view.fancybox.article',
	'order!../app/views/fancybox/jda.view.fancybox.bookmark',


	
	
	
	
	'order!../app/index',

	//custom
	'order!../helpers/utils',
	'order!../ux/jda.ux.search'

	
	//core
	
	//'order!search',

	
	],function(){});

