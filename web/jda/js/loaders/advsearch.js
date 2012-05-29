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
    'order!../lib/modestmaps.min',
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
    $(item).parent().remove();
}

function BoundingBox(map) {
    this.map = map;

    var theBox = this;

    this.getMousePoint = function (e) {
        // start with just the mouse (x, y)
        var point = new com.modestmaps.Point(e.clientX, e.clientY);

        // correct for scrolled document
        point.x += document.body.scrollLeft + document.documentElement.scrollLeft;
        point.y += document.body.scrollTop + document.documentElement.scrollTop;

        // correct for nested offsets in DOM
        for (var node = this.map.parent; node; node = node.offsetParent) {
            point.x -= node.offsetLeft;
            point.y -= node.offsetTop;
        }

        return point;
    };

    var boxDiv = document.createElement('div');
    boxDiv.id = map.parent.id + '-boundingBox';
    boxDiv.width = map.dimensions.x;
    boxDiv.height = map.dimensions.y;
    boxDiv.style.margin = '0';
    boxDiv.style.padding = '0';
    boxDiv.style.position = 'absolute';
    boxDiv.style.top = '0px';
    boxDiv.style.left = '0px';
    boxDiv.style.width = map.dimensions.x + 'px';
    boxDiv.style.height = map.dimensions.y + 'px';
    map.parent.appendChild(boxDiv);

    var box = document.createElement('div');
    box.id = map.parent.id + '-boundingBox-box';
    box.width = map.dimensions.x;
    box.height = map.dimensions.y;
    box.style.margin = '0';
    box.style.padding = '0';
    box.style.outlineWidth = '1000px';
    box.style.outlineColor = 'rgba(0,0,0,0.2)';
    box.style.outlineStyle = 'solid';
    box.style.position = 'absolute';
    box.style.display = 'none';
    box.style.top = '0px';
    box.style.left = '0px';
    box.style.width = '0px';
    box.style.height = '0px';
    boxDiv.appendChild(box);

    // TODO: respond to resize

    var mouseDownPoint = null;

    this.mouseDown = function (e) {
        if (e.shiftKey) {
            mouseDownPoint = theBox.getMousePoint(e);

            box.style.width = '0px';
            box.style.height = '0px';
            box.style.left = mouseDownPoint.x + 'px';
            box.style.top = mouseDownPoint.y + 'px';

            com.modestmaps.addEvent(map.parent, 'mousemove', theBox.mouseMove);
            com.modestmaps.addEvent(map.parent, 'mouseup', theBox.mouseUp);

            map.parent.style.cursor = 'crosshair';

            return com.modestmaps.cancelEvent(e);
        }
    };

    this.mouseMove = function (e) {
        var point = theBox.getMousePoint(e);
        box.style.display = 'block';
        if (point.x < mouseDownPoint.x) {
            box.style.left = point.x + 'px';
        }
        else {
            box.style.left = mouseDownPoint.x + 'px';
        }
        box.style.width = Math.abs(point.x - mouseDownPoint.x) + 'px';
        if (point.y < mouseDownPoint.y) {
            box.style.top = point.y + 'px';
        }
        else {
            box.style.top = mouseDownPoint.y + 'px';
        }
        box.style.height = Math.abs(point.y - mouseDownPoint.y) + 'px';
        theBox.updateInfo();
        return com.modestmaps.cancelEvent(e);
    };

    this.updateInfo = function () {
        if (box.style.display != 'none') {
            var p1 = new com.modestmaps.Point(box.offsetLeft, box.offsetTop);
            var p2 = new com.modestmaps.Point(box.offsetLeft + box.offsetWidth, box.offsetTop + box.offsetHeight);
            //window.console.log(p1,p2);
            var l1 = map.pointLocation(p1);
            var l2 = map.pointLocation(p2);
            //window.console.log(l1,l2);
            var northWest = new com.modestmaps.Location(Math.max(l1.lat, l2.lat), Math.min(l1.lon, l2.lon));
            var southEast = new com.modestmaps.Location(Math.min(l1.lat, l2.lat), Math.max(l1.lon, l2.lon));
            $("#info").html("N,W,S,E: <tt>" + [northWest.lat.toFixed(6), northWest.lon.toFixed(6), southEast.lat.toFixed(6), southEast.lon.toFixed(6)].join(', ') + "</tt>");
            $("#info").html($("#info").html() + "<br>S,W,N,E: <tt>" + [southEast.lat.toFixed(6), northWest.lon.toFixed(6), northWest.lat.toFixed(6), southEast.lon.toFixed(6)].join(', ') + "</tt>");
        }
    };

    this.mouseUp = function (e) {

        theBox.updateInfo();

        com.modestmaps.removeEvent(map.parent, 'mousemove', theBox.mouseMove);
        com.modestmaps.removeEvent(map.parent, 'mouseup', theBox.mouseUp);

        map.parent.style.cursor = 'auto';

        return com.modestmaps.cancelEvent(e);
    };

    com.modestmaps.addEvent(boxDiv, 'mousedown', this.mouseDown);
}

var map, boundingBox;

function initMap() {

    var container = document.getElementById('container');

    map = new com.modestmaps.Map('map',
                                 new com.modestmaps.TemplatedLayer('http://tile.openstreetmap.org/{Z}/{X}/{Y}.png'),
                                 new com.modestmaps.Point(container.offsetWidth, container.offsetHeight));

    map.setCenterZoom(new com.modestmaps.Location(36, 138), 3);

    boundingBox = new BoundingBox(map);

    window.onresize = function () {
        map.setSize(container.offsetWidth, container.offsetHeight);
    };

    function onMapChange() {
        boundingBox.updateInfo();
    }

    map.addCallback('panned', onMapChange);
    map.addCallback('resized', onMapChange);
    map.addCallback('zoomed', onMapChange);
    map.addCallback('extentset', onMapChange);
    map.addCallback('centered', onMapChange);

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
                event.stopPropagation();
                $("#tagListDiv").html($("#tagListDiv").html() + "<span> <a onclick='removeTagItem(this); return false;' href='#' id='tag" + ui.item.value + "'>" + ui.item.label + "</a></span>");
                $("#tagTxt").val("");
                if ($("#tagListDiv").html().substring(0, 8) == "<span> ") {
                    $("#tagListDiv").html($("#tagListDiv").html().substring(0, 6) + $("#tagListDiv").html().substring(7));
                }
            }
        });
        $("#startDateTxt").datepicker();
        $("#endDateTxt").datepicker();
        initMap();
    });
});

