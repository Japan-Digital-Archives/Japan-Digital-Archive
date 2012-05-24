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
	'order!../lib/jquery-ui-1.8.20.custom/js/jquery-ui-1.8.20.custom.min',
	'order!../lib/spin',
	'order!../lib/spin-jquery',
	'order!../lib/date.format',

	'order!../lib/bootstrap',
	'order!../lib/leaflet/leaflet',
	
	'order!../lib/jquery.tagsinput.min',
	'order!../lib/jeditable.min',
	'order!../lib/dateformat/date.format',
    'order!../lib/visualsearch/visualsearch',
	//mvc
	'order!../app/jda',
	
	//plugins

	//models
	'order!../app/models/items',
	'order!../app/models/tag',
	
	//collections
	'order!../app/collections/items',
	
	//views
	'order!../app/views/items/jda.view.item.search-results',
	'order!../app/views/items/jda.view.item.map-popup',
	'order!../app/views/tag.view',
	'order!../app/views/fancybox.views',
	'order!../app/views/map.view',
	'order!../app/index',

	//custom
	'order!../helpers/utils',


		
	//core
	
	//'order!search',

	
	];


var tagList = [{ "id": 1, "title": "test1" }, { "id": 2, "title": "test2" }, { "id": 3, "title": "test3" }, { "id": 4, "title": "test4" }, { "id": 5, "title": "test5"}];

function removeTagItem(item) {
    $(item).button();
}

require(loadFiles, function () {
    $(document).ready(function () {
        $.each(contentTypes, function (key, value) {
            var temp = "<option value='" + value + "'>" + key + "</option>";
            $("#contentTypeDDL").html($("#contentTypeDDL").html() + temp);
        });
        //jda.app.initAdvSearch();
        var tagArr = [];
        $.each(tagList, function (i) {
            tagArr[i] = { "label": this["title"], "value": this["id"] };
        });
        
        $("#tagTxt").autocomplete({
            source: tagArr,
            select: function (event, ui) {
                $("#tagListDiv").html($("#tagListDiv").html() + "<a href='javascript:removeTagItem(this);' id='tag" + ui.item.value + "'>" + ui.item.label + "</a>");
                $("#tag" + ui.item.value).button({ text: true });
            }
        });
    });
    $(function () { $("#testbtn").button({ text: true }); });
});

