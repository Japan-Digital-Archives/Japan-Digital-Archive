
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

	function getCookie(c_name)
	{
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++)
  		{
  			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
 			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  			x=x.replace(/^\s+|\s+$/g,"");
  		if (x==c_name)
    		{
    			return unescape(y);
    		}
  		}
	}	

	function setCookie(c_name,value,exdays)
	{
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=c_name + "=" + c_value;
	}
	$('#jda-language-toggle').find('.btn').click(function(){
		if(!$(this).hasClass('active')){
			console.log('switching languages');
			$('#jda-language-toggle').find('.btn').removeClass('active');
			$(this).addClass('active');
			console.log($(this))
			console.log($(this).data('language'));
			var target_page_language = $(this).data('language');
			if( target_page_language =='en'){
				setCookie("username","ja",365);
				 window.location =  window.location.href.replace('/ja/','/en/');
			}
			else {
				setCookie("username","en",365);
				window.location =  window.location.href.replace('/en/','/ja/');
			}	
		}
	});
	
	
	
 	
	
	
	$('.jda-home-featured-collection').height(Math.max($(window).height()-50, 600));
	
	$(window).resize(function() { $('.jda-home-featured-collection').height(Math.max($(window).height()-50, 600));});
  
	// Shorthand the application namespace
	//http://documentcloud.github.com/visualsearch/
	VisualSearch = VS.init({
		container : $('.visual_search'),
		query     : '',
		callbacks : {
			
			loaded	: function(){ 

				if($(location).attr('href').indexOf('home')>=0){
					$('.VS-search-box').css('width','270px');
					$('#VS-search input').css('width', '200px');
				} else{
					$('.VS-search-box').css('width','500px');
					$('#VS-search input').css('width', '430px');
				}
				$("#jda-home-search-div, #search-bar").fadeTo('slow',1); 
				$('#VS-search input').attr('placeholder', 'Explore the Archive');
				
				$('#VS-search input').css('padding-top', '9px');
				$('#VS-search input').focus(function(){
					//$(this).attr('placeholder', '');
					$(this).css('width', '3px');
				});

				/*$('#jda-go-button').click(function(){
					alert("clicked");
					console.log("clicked");
					var query = VisualSearch.searchBox.value();
					var re1 = new RegExp("^[\u4E00-\uFA29]*$"); //Chinese character range
					var re2 = new RegExp("^[\uE7C7-\uE7F3]*$"); //Chinese character range
					query = query.replace(/(^\s*)|(\s*$)/g,'');
					if (!(re1.test(query) && (! re2.test(query))))
					{
						
						window.location = 'http://www.jdarchive.org/ja/search#q=' + query;
					}
					else
					{
						window.location = 'http://www.jdarchive.org/ja/search#q=' + query;
					}
					
				
					//window.location = 'search#q=' + query;
				});*/
			},

			search : function(){ 
			
			var facets = VisualSearch.searchQuery.models;
			
			
			var tagQuery = "tag:";
			var textQuery = "";
			//var usernameQuery = "";
			
			_.each(facets, function(facet){
				console.log(facet.get('category'));
				switch ( facet.get('category') )
				{
					case 'text':
						textQuery = (textQuery.length > 0) ? textQuery + " AND " + facet.get('value') : facet.get('value'); 
						textQuery=textQuery.replace(/^#/, '');
						break;
					case 'tag':
						tagQuery = (tagQuery.length > 4) ? tagQuery + ", " + facet.get('value') : tagQuery + facet.get('value');
						tagQuery=tagQuery.replace(/^#/, '');
						break;
					/*
					case 'user':
						usernameQuery = facet.get('value');
						break;
					*/
			    }
			});
			
			var query = textQuery + (textQuery.length > 0 && tagQuery.length > 4 ? " " : "") + (tagQuery.length > 4 ? tagQuery : "");
	
			//var query = VisualSearch.searchBox.value();
                        var re1 = new RegExp("^[\u4E00-\uFA29]*$"); //Chinese character range
                        var re2 = new RegExp("^[\uE7C7-\uE7F3]*$"); //Chinese character range
                        query = query.replace(/(^\s*)|(\s*$)/g,'');
                        if (!(re1.test(query) && (! re2.test(query))))
                        {
                             window.location = 'http://www.jdarchive.org/en/search#q=' + query;
                       	}
                        else
                        {
                             window.location = 'http://www.jdarchive.org/ja/search#q=' + query;
                        }

			// window.location = 'search#q=' + query;
				
			},

			clearSearch : function(){ $('input').val('');},
			// These are the facets that will be autocompleted in an empty input.
			facetMatches : function(callback)
			{
				callback([
					//'tag', 'keyword', 'text', 'data:time & place','collection','user'
					'tag','text'
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

	$('#jda-go-button').click(function(){

	  	var e = jQuery.Event("keydown");
		e.which = 13;

		//For whatever reason there are two ways of telling VS to search
		//based on whether the facet has been created yet or not
		if ( $(".search_facet_input_container input").length ){
			$(".search_facet_input_container input").trigger(e);
		} else{
			VisualSearch.searchBox.searchEvent(e);
		}
		
  		return false;
  	});

});
