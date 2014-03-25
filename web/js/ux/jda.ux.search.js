$(document).ready(function(){


    var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion)|| "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)    {
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
        {     string: navigator.userAgent,
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
        {        // for newer Netscapes (6+)
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
        {         // for older Netscapes (4-)
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
            $('#jda-language-toggle').find('.btn').removeClass('active');
            $(this).addClass('active');
            if($(this).data('language')=='en') window.location =  window.location.href.replace('/ja/','/en/');
            else window.location =  window.location.href.replace('/en/','/ja/');
        }

    });







    /*********** SEARCH SPECIFIC GO TO PROFILE PAGE ****************/





  $("#jda-search-button-group,#search-bar").fadeTo('fast',1);

  //View buttons toggle
  $("#zeega-view-buttons button").tooltip({'placement':'bottom', delay: { show: 600, hide: 100 }});

  $('#zeega-view-buttons a').click(function(){ jda.app.switchViewTo( $(this).data('goto-view') , true); return false; });

  $('#zeega-search-help').popover({'title':l.jda_searching,'placement':'bottom', 'dataString': "bro"});
	var searchHelp = $("#zeega-search-help");
	searchHelp.attr("data-content","Enter your keyword search in the box to the left. <br><br> To search only tags, begin your search with &quot;t&quot; and select &quot;tag:&quot;").data('popover').setContent();
	searchHelp.data('popover').$tip.addClass(searchHelp.data('popover').options.placement);

  $('#zeega-content-type').change(function(){
    $('#select-wrap-text').text( $('#zeega-content-type option[value=\''+$('#zeega-content-type').val()+'\']').text() );
    jda.app.parseSearchUI();
    return false;
  });

  $('#zeega-sort').change(function(){
        jda.app.sort();
     });


  $(window).resize(function() {
    if (jda.app.currentView == "event"){
      jda.app.eventMap.resetMapSize();
    }
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
  $('#noRTChk').click(function () {
    var e = jQuery.Event("keydown");
    e.which = 13;
    VisualSearch.searchBox.searchEvent(e);
  });


  //Infinite Scroll
  jda.app.killScroll = false;
  $(window).scroll(function(){
    //don't execute if the app is loading, if it's too far down, or if the viewing the map event view
    if  ( jda.app.isLoading === false && $(window).scrollTop()+200 >= ($(document).height() - ($(window).height())) && jda.app.currentView != 'event' ) {
        // Keeps the loader from fetching more than once.
        if (jda.app.killScroll === false) {
            $('#spinner-text').fadeTo('fast',1);
            $('#jda-left').fadeTo('slow',0.8);
            jda.app.killScroll = true;
            jda.app.searchObject.page=jda.app.resultsView.collection.search.page+1;
            jda.app.search(jda.app.searchObject);
      }
    }
  });




  //Sets variable for Fancybox "more" view to false each time the page is reloaded
  sessionStorage.setItem('moreFancy', false);

  //set up fancybox lightbox plugin
  $(".thumb-fancymedia,.map-fancymedia,.list-fancymedia").fancybox({

    openEffect : 'fade',
      closeEffect : 'fade',
      openSpeed : 'fast',
      closeSpeed : 'fast',
    closeClick:false,
    nextClick:false,
    mouseWheel:false,
    fitToView:false,
    arrows:false,
    closeBtn:false,
    aspectRatio:true,
    scroll:'none',
      // Changing next gallery item
    nextEffect: 'none', // 'elastic', 'fade' or 'none'
    nextSpeed: 700,
    nextEasing: 'none',
    nextMethod: 'changeIn',

    // Changing previous gallery item
    prevEffect: 'none', // 'elastic', 'fade' or 'none'
    prevSpeed: 700,
    prevEasing: 'none',
    prevMethod: 'changeOut',

    keys: {
        next: [ 34, 39, 40], //  page down, right arrow, down arrow
        prev: [ 33, 37, 38], //  page up, left arrow, up arrow
        close: [27] // escape key
    },

      helpers : {
        title : false,
        buttons: {}

      },
      beforeClose : function() {

          if (this.fancyView !==null){
            this.fancyView.beforeClose();
          }
          $('a.btnNext, a.btnPrev, a.btnClose').fadeOut('slow');
          //set video src to null to prevent browser bug
          $('video').attr("src", null);

          //reactivate keyboard controls for OL map so arrow scrolling works again

       /*
       if (!_.isUndefined(jda.app.map)){
          var keyboardControls = jda.app.map.getControlsByClass('OpenLayers.Control.KeyboardDefaults');
          keyboardControls[0].activate();
        }

    */

      },
      afterShow : function(){
        this.fancyView.afterShow();
        $('#fancybox-buttons a.btnNext').show();
      },

    /* This is where we decide which kind of content to put in the fancybox */

      beforeLoad : function() {

        //deactivate keyboard controls for OL map so arrow scrolling doesn't scroll map too
        /*
        if (!_.isUndefined(jda.app.map)){
        var keyboardControls = jda.app.map.getControlsByClass('OpenLayers.Control.KeyboardDefaults');
        keyboardControls[0].deactivate();
        }
        */

        var Browser = jda.module("browser");
        $('#fancybox-document-cloud').remove();


        var elementID = $(this.element).attr('id');
          var thisModel = jda.app.currentView == 'list' || jda.app.currentView == 'thumb' ? jda.app.resultsView.collection.get(elementID) : jda.app.eventMap.mapViewCollection.collection.get(elementID);

          this.fancyView = null;


        //Bookmark refers to all items that must be accessed through external site

        if(thisModel.get("layer_type")=="Bookmark"){
          this.fancyView = new Browser.Views.FancyBox.Bookmark({model:thisModel});
        }

        else {
          switch(thisModel.get("media_type")){
            case 'Image':
              this.fancyView = new Browser.Views.FancyBox.Image({model:thisModel});
              break;
            case 'Video':
              this.fancyView = new Browser.Views.FancyBox.Video({model:thisModel});
              break;
            case 'Audio':
              this.fancyView = new Browser.Views.FancyBox.Audio({model:thisModel});
              break;
            case 'Tweet':
              this.fancyView = new Browser.Views.FancyBox.Tweet({model:thisModel});
              break;
            case 'Text':
              this.fancyView = new Browser.Views.FancyBox.Testimonial({model:thisModel});
              break;
            case 'Document':
              this.fancyView = new Browser.Views.FancyBox.DocumentCloud({model:thisModel});
              break;
            case 'Website':
              this.fancyView = new Browser.Views.FancyBox.Website({model:thisModel});
              break;
            case 'Article':
              this.fancyView = new Browser.Views.FancyBox.Article({model:thisModel});
              break;
            default:
              this.fancyView = new Browser.Views.FancyBox.Default({model:thisModel});
          }
        }

        this.fancyView.render(this);
      }

  });

});
