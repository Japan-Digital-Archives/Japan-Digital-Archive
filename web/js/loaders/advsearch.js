/********************************************

	MAIN.JS
	
	VERSION 0.1
	
	LOADS JS FILES


*********************************************/

var loadFiles = [
	'order!../lib/jquery/jquery-1.7.1.min',
	'order!../lib/underscore/underscore-min',
	'order!../lib/backbone/backbone-0.9.1',
	'order!../lib/jquery-easing/jquery.easing.1.3',
	'order!../lib/jquerySVG/jquery.svg',
	'order!../lib/jquery-ui-1.8.20.custom/js/jquery-ui-1.8.20.custom.min',
	'order!../lib/spin',
	'order!../lib/spin-jquery',
	'order!../lib/date.format',

	'order!../lib/bootstrap-2.0.2/js/bootstrap.min',
	'order!../lib/leaflet/leaflet',
	
	'order!../lib/jquery.tagsinput.min',
	'order!../lib/jeditable.min',
	'order!../lib/dateformat/date.format',
    'order!../lib/visualsearch/visualsearch',
    'order!../lib/modestmaps.min',
	];


var tagList = [{ "id": 1, "title": "test1" }, { "id": 2, "title": "test2" }, { "id": 3, "title": "test3" }, { "id": 4, "title": "test4" }, { "id": 5, "title": "test5"}];

function removeTagItem(item) {
    $(item).parent().remove();
}

var north, east, south, west;

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
            $("#info").html("N,W,S,E: <b>" + [northWest.lat.toFixed(6), northWest.lon.toFixed(6), southEast.lat.toFixed(6), southEast.lon.toFixed(6)].join(', ') + "</b>");
            north = northWest.lat.toFixed(6);
            east = southEast.lon.toFixed(6);
            south = southEast.lat.toFixed(6);
            west = northWest.lon.toFixed(6);
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

    map.setCenterZoom(new com.modestmaps.Location(36, 138), 4);

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


function DoSearch() {

    var baseURL = window.location.href.replace('/advsearch','')  + '/search?#';
    if($("#searchTerms").val()) {
        baseURL += "q=" + $("#searchTerms").val();
    }
    var contentType = $("#contentTypeDDL option:selected").length;
    if (contentType != 0) {
        var first = $("#contentTypeDDL option:selected").first().val();
        if (first != "0") {
            baseURL += "&media_type=";
            baseURL += $("#contentTypeDDL option:selected").map(function(){ return this.value }).get().join(" OR ");
        }
    }
    var tagArr = new Array();
    $("#tagListDiv > span > a").each(function (i) {
        var temp = $(this).attr("id");
        temp = temp.substring(3);
        tagArr[i] = temp;
    });
    if (tagArr.length != 0) {
        baseURL += "&tags=" + tagArr.join(",");
    }
    if (north != null) {
        baseURL += ("&geo_n=" + north + "&geo_e=" + east + "&geo_s=" + south + "&geo_w=" + west);
    }
    var startDate = $("#startDateTxt").val();
    var endDate = $("#endDateTxt").val();
    if (startDate != "") {
        var sDate = new Date(startDate);
        baseURL += "&media_after=" + (sDate.getTime() / 1000);
    }
    if (endDate != "") {
        var eDate = new Date(endDate);
        baseURL += "&media_before=" + (eDate.getTime() / 1000);
    }
    var usersVal = $("#userDDL option:selected").val();
    if (usersVal == -1) {
        baseURL += "&user=" + usersVal;
    }

    var collectionVal = $("input[name='collRbl']:checked").val();
    if (collectionVal == 1) {
        baseURL += "&r_collections=1";
    }
    if (collectionVal == 2) {
        baseURL += "&r_itemswithcollections=1";
    }

    window.location.href = baseURL;
}

require(loadFiles, function () {
    $(document).ready(function () {
        // contentTypes is declares in the twig file so that things can be localized
        $.each(contentTypes, function (key, value) {
            var temp = "<option value='" + value + "'>" + key + "</option>";
            $("#contentTypeDDL").html($("#contentTypeDDL").html() + temp);
        });

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
        
        
        
	var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

	};
		BrowserDetect.init();
		console.log(BrowserDetect);





	/***************************************************/
	/*************** HEADER ****************************/
	/***************************************************/


	/*************** USER LOGIN ************************/
	
	$('#sign-in').click(function(){
	    $('#user-modal-body').empty().append('<iframe class="login" src="' + document.location.href.replace("advsearch", "") + 'login?_locale=' + sessionStorage.getItem('locale') + '"></iframe>');
		$('#user-modal').modal('show'); 
		return false;
	});
	
	
	$('#user-modal').bind('authenticated',function(){
		$('#sign-in').hide(); 
		$('#user-dropdown').show();
		$('#jda-header-me').show();
		if(!_.isUndefined(window.jda))jda.app.userAuthenticated();
		return false;
	});
	
	
	$('#user-modal').bind('close',function(){$("#user-modal-close").trigger('click');});
	

	
	/*************** ACCOUNT SETTINGS ************************/
	
	$('#account-settings').click(function(){
		$('#user-modal-body').empty().append('<iframe class="login" src="/'+sessionStorage.getItem('directory')+'profile/change-password?_locale='+sessionStorage.getItem('locale')+'"></iframe>');
		$('#user-modal').modal('show'); 
		return false;
		
	});
	

	
	
	/************  BUG REPORT **********************/
	
	
	$('.bug-report').click(function(e){e.stopPropagation();});
	
	$('.bug-report').parent().click(function(){
		$('.bug-unsubmitted').show();
		$('.bug-submitted').hide();
	});
	
	$('.close-bug').click(function(){
		$('.bug-report').parent().trigger('click');
	});
	
	
	$('.submit-bug').click(function(){
		
		var bug = new Backbone.Model({
		
			url:window.location.href,
			hash: window.location.hash.substr(1),
			description: $('.bug-description').val(),
			email: $('.bug-email').val(),
			browser: BrowserDetect.browser,
			version: BrowserDetect.version,
			os:BrowserDetect.OS,
			login:sessionStorage.getItem('user')
		
		});
		
		bug.url="http://dev.jdarchive.org/bugs/report.php";
		bug.save();
		$('.bug-description').attr('value','');
		$('.bug-unsubmitted').fadeOut('fast',function(){
				$('.bug-submitted').fadeIn();
		});
	
	});
	
	

	/*************** LANGUAGE TOGGLE ************************/
	$('#jda-language-toggle').find('.btn').click(function(){
		if(!$(this).hasClass('active')){
			console.log('switching languages');
			$('#jda-language-toggle').find('.btn').removeClass('active');
			$(this).addClass('active');
			console.log($(this).data('language'));
			if($(this).data('language')=='en') window.location =  window.location.href.replace('/ja/','/en/');
			else window.location =  window.location.href.replace('/en/','/ja/');
		}
		
	});
	
	
	
	
	
    });
});

