
$(document).ready(function(){
	

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
		$('#user-modal-body').empty().append('<iframe class="login" src="/'+sessionStorage.getItem('directory')+'login?_locale='+sessionStorage.getItem('locale')+'"></iframe>');
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
	
	
	
	/************ Item Page *************************/
	
	if($('#map').data('lat')!=""){
		$('.map-wrapper').show();
		var baseLayer= new L.TileLayer('http://{s}.tiles.mapbox.com/v2/mapbox.mapbox-streets/{z}/{x}/{y}.png', {maxZoom: 18, attribution:""});
		var div = $('.jda-item-map-container').get(0);
		var map = new L.Map(div);
		var latLng= new L.LatLng(parseFloat($('#map').data('lat')),parseFloat($('#map').data('lng')));
		var marker = new L.Marker(latLng,{draggable:false});
		map.setView( latLng, 13).addLayer(baseLayer).addLayer(marker);
		$('.leaflet-control-attribution').hide();
    }

	if($('#item').data('media_type')=="Image"){
		
		$('#item').append('<img src="'+$('#item').data('uri')+'" class="jda-item-image"/>');
	
	}
	
	
	
	
	


});