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
    'order!../lib/jquery.validate.min',
    'order!../lib/spin',
    'order!../lib/spin-jquery',
    'order!../lib/date.format',

    'order!../lib/bootstrap-2.0.2/js/bootstrap.min',
    'order!../lib/leaflet/leaflet',

    'order!../lib/jquery.tagsinput',
    'order!../lib/jeditable.min',
    'order!../lib/visualsearch/visualsearch',
    'order!../lib/modestmaps.min',
    'order!../lib/chosen/chosen.jquery.min',
    'order!../lib/maps',
    'order!../lib/timepicker/jquery-ui-timepicker-addon',
    'order!../lib/timepicker/jquery-ui-sliderAccess',
];


var map;
var geocoder;
var marker;

function initializeMap() {
    var latlng = new google.maps.LatLng(38.268215, 140.869356);
    var myOptions = {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
        myOptions);

    geocoder = new google.maps.Geocoder();

    marker = new google.maps.Marker({
        position: latlng,
        map: map,
    });

    marker.setDraggable(true);
    google.maps.event.addListener(
      marker,
      'dragend',
      function () {
          var newpos = marker.getPosition();
          $('#latlng').html(newpos.toString());
          $('#lat').val(newpos.lat());
          $('#lng').val(newpos.lng());
      });
}

function showAddress() {
    var address = $('#address').val();
    var geocoderRequest = {
        address: address
    };
    geocoder.geocode(
      geocoderRequest,
      function (result, status) {
          if (status != 'OK') {
              alert('Google could not locate this address.');
              return;
          }
          var latlng = result[0].geometry.location;
          map.setCenter(latlng);
          marker.setPosition(latlng);
          $('#latlng').html(latlng.toString());
          $('#lat').val(latlng.lat());
          $('#lng').val(latlng.lng());
      });
}

function initMultiMap() {
    JA_Map.instance = new JA_Map(38.268215, 140.869356, 5, 'map_canvas', google.maps.MapTypeId.ROADMAP);


    $(JA_Map.instance.addButton.button).click(function () {
        new JA_Marker(JA_Map.instance.map, JA_Map.instance.map.getCenter());
    });

    $('#geocode_button').click(function () {
        JA_Map.instance.showAddress($('#address').val());
    });

    $('input#address').bind("keypress", function (e) {
        if (e.keyCode == 13) {
            JA_Map.instance.showAddress($('#address').val());
            e.preventDefault();
        }
    });

    // Prefill

    if (typeof JA.lat == 'object' & JA.lat != null) {
        $.each(JA.lat, function (idx, val) {
            var latlng = new google.maps.LatLng(parseFloat(val), parseFloat(JA.lng[idx]));
            var marker = new JA_Marker(JA_Map.instance.map, latlng);
            marker.setName(JA.location_name[idx]);
        });
    }

    JA_Marker.showAll();
}

function removeImg(btn) {
    $(btn).parent().parent().remove();
}

require(loadFiles, function () {
    $(document).ready(function () {
        var layerMediaMap = {
            Video: "YouTube",
            Website: "Website",
            Document: "PDF",
            Image: "Image",
            Audio: "Audio",
        };
        $("#tagsSelect").chosen({
            create_option_text: 'Add New Tag',
            create_option: true,
            persistent_create_option: true
        });
        setTimeout(function () {
                initializeMap();
        }, 1000);

        $('#toTxt').datetimepicker();
        $('#fromTxt').datetimepicker();
        $('#dateCreatedTxt').datetimepicker();

        for (var i = 1900; i <= new Date().getFullYear(); i++) {
            $("#yearDDL").append("<option value='" + i.toString() + "'>" + i.toString() + "</option>");
        }

        $("#addImageBtn").click(function () {
            $("#imgTbl").append("<tr><th>Url:</th><td><input type='text' /></td><td><input type='button' value='Remove' onclick='removeImg(this);' /></td></tr>");
        });

        $("#contributeForm").validate({
            rules: {
                pageTitleTxt: "required",
                urlTxt: {
                    required: true,
                    url: true
                },
                languageChk: {
                    required: true,
                    minlength: 1
                }
            },
            messages: {
                pageTitleTxt: "Please enter a title",
                urlTxt: "Please enter the URL for the seed",
                languageChk : "Please select at least 1 language"
            }
        });

        $("#submitContributeBtn").click(function () {
            if ($("#contributeForm").valid()) {
                var baseApiUrl = "http://" + document.domain + "/zeega/api/items?api_key=9bIRe71qSeHeVQIcb54NNqY-y&force_key=true"
                var postObj = {};

                postObj.title = $("#pageTitleTxt").val();
                postObj.description = $("#descriptionTxt").val();
                postObj.layer_type = layerMediaMap[$("#categoryDDL > option:selected").val()]; // fix this based on https://github.com/Zeega/Zeega-Core/wiki/Database-schema
                postObj.media_type = $("#categoryDDL > option:selected").val();
                postObj.uri = "http://wayback.archive-it.org/2438/20110301000000/" + $("#urlTxt").val();
                postObj.attribution_uri = $("#urlTxt").val();
                postObj.media_creator_username = $("#nameTxt").val().trim() != "" ? $("#nameTxt").val().trim() : "Not Given";
                postObj.media_creator_realname = $("#nameTxt").val().trim() != "" ? $("#nameTxt").val().trim() : "Not Given";
                if ($("#dateCreatedTxt").val().trim() != "") {
                    var created_date = new Date(Date.parse($("#dateCreatedTxt").val(), "m/d/Y H:i")).toDateString();
                    postObj.media_date_created = created_date;
                } else {
                    postObj.media_date_created = new Date().toDateString();
                }

                if ($("#lat").val() != "") {
                    postObj.media_geo_latitude = parseFloat($("#lat").val());
                    postObj.media_geo_longitude = parseFloat($("#lng").val());
                }
                postObj.tags = [];
                $("#tagsSelect option:selected").each(function () {
                    postObj.tags.push($(this).val());
                });


                postObj.attributes = {};
                postObj.attributes.frequency = $("#frequencyDDL > option:selected").val();
                postObj.attributes.scope = $("#scopeDDL > option:selected").val();
                postObj.attributes.email = $("#emailTxt").val();

                postObj.attributes.language = $("#englishChk").is(":checked") ? "English|" : "";
                postObj.attributes.language += $("#japaneseChk").is(":checked") ? "Japanese|" : "";
                postObj.attributes.language += $("#chineseChk").is(":checked") ? "Chinese|" : "";
                postObj.attributes.language += $("#koreanChk").is(":checked") ? "Korean|" : "";

                postObj.published = 0;
                postObj.archive = "Seeds";

                $.post(baseApiUrl, postObj, function (response) {
                }).error(function () { alert("There was a problem with your submission, please try again"); }).success(function () {
                    alert('Thank you! Your submission has been received.');
                    document.location.href = document.location.href.replace("contribute/", "home");
                });
            }
        });

        $("#testimonialForm").validate({
            rules: {
                titleTxt: "required",
                emailTxt: {
                    required: true,
                    email: true
                },
                storyTxt: "required",
                termsChk: "required"
            },
            messages: {
                titleTxt: "Please enter a title",
                emailTxt: "Please enter an email",
                storyTxt: "Please enter your story",
                termsChk: "Please agree to the Terms"
            }
        });

        $("#submitTestimonialBtn").click(function () {
            if ($("#testimonialForm").valid()) {
                var baseApiUrl = "http://" + document.domain + "/zeega/api/items?api_key=9bIRe71qSeHeVQIcb54NNqY-y&force_key=true"
                var postObj = {};

                postObj.title = $("#titleTxt").val();
                postObj.description = $("#descriptionTxt").val();
                postObj.media_type = "Text";
                postObj.layer_type = "Testimonial";
                postObj.uri = $("#titleTxt").val().replace(" ", "-");
                postObj.attribution_uri = $("#titleTxt").val().replace(" ", "-");
                postObj.media_creator_username = $("#nameTxt").val().trim() != "" ? $("#nameTxt").val().trim() : "Not Given";
                postObj.media_creator_realname = $("#nameTxt").val().trim() != "" ? $("#nameTxt").val().trim() : "Not Given";
                postObj.media_date_created = new Date().toDateString();

                if ($("#lat").val() != "") {
                    postObj.media_geo_latitude = parseFloat($("#lat").val());
                    postObj.media_geo_longitude = parseFloat($("#lng").val());
                }

                postObj.text = $("#storyTxt").val();

                postObj.attributes = {};
                if ($("#fromTxt").val().trim() != "") {
                    var fromDate = new Date(Date.parse($("#fromTxt").val(), "m/d/Y H:i"));
                    postObj.attributes.from_year = fromDate.getFullYear();
                    postObj.attributes.from_month = fromDate.getMonth() + 1;
                    postObj.attributes.from_day = fromDate.getDate();
                    postObj.attributes.from_hour = fromDate.getHours();
                    //postObj.attributes.from_date = fromDate;
                }
                if ($("#toTxt").val().trim() != "") {
                    var toDate = new Date(Date.parse($("#toTxt").val(), "m/d/Y H:i"));
                    postObj.attributes.to_year = toDate.getFullYear();
                    postObj.attributes.to_month = toDate.getMonth() + 1;
                    postObj.attributes.to_day = toDate.getDate();
                    postObj.attributes.to_hour = toDate.getHours();
                    //postObj.attributes.to_date = toDate;
                }

                postObj.attributes["year-of-birth"] = $("#yearDDL > option:selected").val();
                postObj.attributes.occupation = $("#occupationTxt").val();
                postObj.attributes.images = [];
                $("#imgTbl").find("input[type='text']").each(function () {
                    postObj.attributes.images.push($(this).val());
                });
                postObj.attributes.privacy = $("#privacyDDL > option:selected").val();
                postObj.attributes.residence = $("#residenceTxt").val();
                postObj.published = 0;
                postObj.api_key = "9bIRe71qSeHeVQIcb54NNqY-y";
                postObj.archive = "Testimonial";
                postObj.attributes.email = $("#emailTxt").val();

                $.post(baseApiUrl, postObj, function (response) {
                }).error(function () { alert("There was a problem with your submission, please try again"); }).success(function () {
                    alert('Thank you! Your submission has been received.');
                    document.location.href = document.location.href.replace("testimonial/", "home");
                });
            }
        });

        var BrowserDetect = {
            init: function () {
                this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
                this.version = this.searchVersion(navigator.userAgent)
                    || this.searchVersion(navigator.appVersion)
                    || "an unknown version";
                this.OS = this.searchString(this.dataOS) || "an unknown OS";
            },
            searchString: function (data) {
                for (var i = 0; i < data.length; i++) {
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
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            },
            dataBrowser: [
                {
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                {
                    string: navigator.userAgent,
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
                {       // for newer Netscapes (6+)
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
                {       // for older Netscapes (4-)
                    string: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }
            ],
            dataOS: [
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

        $('#sign-in').click(function () {
            $('#user-modal-body').empty().append('<iframe class="login" src="' + document.location.href.replace("testimonial/", "").replace("contribute/", "") + 'login?_locale=' + sessionStorage.getItem('locale') + '"></iframe>');
            $('#user-modal').modal('show');
            return false;
        });


        $('#user-modal').bind('authenticated', function () {
            $('#sign-in').hide();
            $('#user-dropdown').show();
            $('#jda-header-me').show();
            if (!_.isUndefined(window.jda)) jda.app.userAuthenticated();
            return false;
        });


        $('#user-modal').bind('close', function () { $("#user-modal-close").trigger('click'); });



        /*************** ACCOUNT SETTINGS ************************/

        $('#account-settings').click(function () {
            $('#user-modal-body').empty().append('<iframe class="login" src="/' + sessionStorage.getItem('directory') + 'profile/change-password?_locale=' + sessionStorage.getItem('locale') + '"></iframe>');
            $('#user-modal').modal('show');
            return false;

        });




        /************  BUG REPORT **********************/


        $('.bug-report').click(function (e) { e.stopPropagation(); });

        $('.bug-report').parent().click(function () {
            $('.bug-unsubmitted').show();
            $('.bug-submitted').hide();
        });

        $('.close-bug').click(function () {
            $('.bug-report').parent().trigger('click');
        });


        $('.submit-bug').click(function () {

            var bug = new Backbone.Model({

                url: window.location.href,
                hash: window.location.hash.substr(1),
                description: $('.bug-description').val(),
                email: $('.bug-email').val(),
                browser: BrowserDetect.browser,
                version: BrowserDetect.version,
                os: BrowserDetect.OS,
                login: sessionStorage.getItem('user')

            });

            bug.url = "http://dev.jdarchive.org/bugs/report.php";
            bug.save();
            $('.bug-description').attr('value', '');
            $('.bug-unsubmitted').fadeOut('fast', function () {
                $('.bug-submitted').fadeIn();
            });

        });



        /*************** LANGUAGE TOGGLE ************************/
        $('#jda-language-toggle').find('.btn').click(function () {
            if (!$(this).hasClass('active')) {
                console.log('switching languages');
                $('#jda-language-toggle').find('.btn').removeClass('active');
                $(this).addClass('active');
                console.log($(this).data('language'));
                if ($(this).data('language') == 'en') window.location = window.location.href.replace('/ja/', '/en/');
                else window.location = window.location.href.replace('/en/', '/ja/');
            }

        });





    });
});

