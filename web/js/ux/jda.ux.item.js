/// <reference path="jda.ux.item.js" />

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
		
		

		if((BrowserDetect.browser=='Firefox'&&BrowserDetect.version<12)||(BrowserDetect.browser=='Explorer'&&BrowserDetect.version<9)) {
			$('#browserModal').modal('show');
			console.log(BrowserDetect.version);
		}





	/***************************************************/
	/*************** HEADER ****************************/
	/***************************************************/


	/*************** USER LOGIN ************************/
	
	$('#sign-in').click(function(){
		$('#user-modal-body').empty().append('<iframe class="login" src="'+$('#sign-in').data('link')+'"></iframe>');
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
		$('#user-modal-body').empty().append('<iframe class="login" src="'+sessionStorage.getItem('hostname')+sessionStorage.getItem('directory')+'profile/change-password?_locale='+sessionStorage.getItem('locale')+'"></iframe>');
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
		
		bug.url="../bugs/report.php";
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
		var baseLayer= new L.TileLayer('http://{s}.tiles.mapbox.com/v2/zeega.map-2w4y8pj8/{z}/{x}/{y}.png', {maxZoom: 18, attribution:""});
		var div = $('.jda-item-map-container').get(0);
		var map = new L.Map(div);
		var latLng= new L.LatLng(parseFloat($('#map').data('lat')),parseFloat($('#map').data('lng')));
		var marker = new L.Marker(latLng,{draggable:false});
		map.setView( latLng, 13).addLayer(baseLayer).addLayer(marker);
		$('.leaflet-control-attribution').hide();
    } else{
    	//greyed out map image
    	$('#map').addClass('jda-no-geo-info');
    	$('.jda-no-geo-location-message').show();
    }
    switch($('#item').data('media_type')){
      case 'Image':
        $('#item').append('<img src="'+$('#item').data('uri')+'" class="jda-item-image"/>');
        break;
      case 'Video':
      	this.unique =Math.floor(Math.random() *10000)
		$('#item').append($('<div>').attr({id:'item-video-'+this.unique}));
		
      	switch( $('#item').data("layer_type") )
		{

			case 'Video':
				var source = $('#item').data('uri');
				this.plyr = new Plyr('item-video-'+this.unique,{url:source,controls:1});
				break;
			case 'Youtube':
				var source = "http://www.youtube.com/watch?v="+$('#item').data('uri');
				this.plyr = new Plyr('item-video-'+this.unique,{url:source,controls:1});
				break;
			case 'Vimeo':
				var source = "http://vimeo.com/"+$('#item').data('uri');
				this.plyr = new Plyr('item-video-'+this.unique,{url:source,controls:0});
				break;
		
		}
		$(window).unload(function() {
		  	this.plyr.destroy();
		});
        
        break;
      
      case 'Audio':
      	this.unique =Math.floor(Math.random() *10000)
		$('#item').append($('<div">').attr({id:'item-video-'+this.unique}));
		
		var source = $('#item').data('uri');
		this.plyr = new Plyr('item-video-'+this.unique,{url:source,controls:1});
				
		$('#item video').css({'height':'0','margin-top':'31px'});

		$(window).unload(function() {
		  	this.plyr.destroy();
		});
        
        break;
      case 'Tweet':
      	$('#item').append('<p class="fancybox-tweet">'+linkifyTweet($('#item').data('text'))+'</p>');
        break;
      case 'Text':
        $('#item').append('<p class="fancybox-testimonial">'+linkifyTweet($('#item').data('text'))+'</p>');
        break;
      case 'Document':

      	$('#item').append('<div id="fancybox-document-cloud" class="DV-container"></div>'+
						'<script>'+
						"DV.load('http://www.documentcloud.org/documents/"+$('#item').data('uri') +".js', {"+
						'sidebar: false, width:600,height:439,'+
						'container: "#fancybox-document-cloud"'+
						'      });'+
						'</script>');
        
        break;
         
      case 'Website':
      
	    var parts=$('#item').data('attribution_uri').split('http');
	    var original_src = "http"+parts[parts.length-1];
		var src= $('#item').data('attribution_uri');

      	$('#item').append('<div class="website-caption"><a href="'+original_src+'" target="_blank">'+original_src+'</a></div>'+
					'<div id="jda-item-website">'+
					'<iframe type="text/html" width="100%" height="400px" src="'+src+'" frameborder="0">'+
					'</iframe>'+
					'</div>');
       
      	break;
        case 'Headline':
            // currently, nothing happens for news articles, so nothing happens here.
            break;
      }

});