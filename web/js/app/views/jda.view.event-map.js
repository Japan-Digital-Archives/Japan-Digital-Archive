(function(Browser) {


	Browser.Views = Browser.Views || {};

	Browser.Views.EventMap = Backbone.View.extend(
		{
		
		tagName : 'div',
		className: 'event-map',
			
		mapLoaded : false,
		timeSliderLoaded : false,
		japanMapUrl : sessionStorage.getItem("japanMapUrl"),
		geoUrl : sessionStorage.getItem("geoServerUrl"),
	
		initialize : function()
		{
		
		
		},
	
		events : {

		},
	
		render : function( )
		{
			return this.el;
		},
		
		load : function(){
			this.resetMapSize();

			if( !this.mapLoaded ) this.initMap();
			else if( jda.app.resultsView.getCQLSearchString()!=null){
				
				this.map.getLayersByName('cite:item - Tiled')[0].mergeNewParams({
						'CQL_FILTER' : jda.app.resultsView.getCQLSearchString()
					});
		 	}
			
		
		},
		
		initMap : function(){
			console.log("Initializing Map");

			OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
			OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
		
			var _this=this;
			wax.tilejson('http://d.tiles.mapbox.com/v2/mapbox.mapbox-streets.jsonp',
				function(tilejson) {
					var baseLayer =  wax.ol.connector(tilejson);
					var dataLayer =  new OpenLayers.Layer.WMS(
						"cite:item - Tiled",
						_this.geoUrl + "cite/wms",
							{
								layers : 'cite:item',
								transparent : true,
								format : 'image/png',
								//'CQL_FILTER' : function(){ return this.resultsView.getCQLSearchString() },
								tiled: true,
								
							},
							{
								buffer: 0,
									displayOutsideMaxExtent: true,
									isBaseLayer: false,
									yx : {'EPSG:900913' : false},
									'sphericalMercator': true,
									'maxExtent': new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
			
							}
					);
					
					_this.map = new OpenLayers.Map('event-map',{
						
						//controls: [ new OpenLayers.Control.PanZoomBar()],
						controls: [new OpenLayers.Control.ZoomPanel(),new OpenLayers.Control.Navigation()],
						layers: [baseLayer],
						maxResolution: 1.3053327578125,
						projection: "EPSG:900913",
						units: 'm'
				
					});
					var proj = new OpenLayers.Projection("EPSG:4326");
					
					_this.map.setCenter(new OpenLayers.LonLat(140.652466, 38.052417).transform(proj, _this.map.getProjectionObject()), 9);
					_this.startMapListeners( _this.map );
				
					//_this.initTimeSlider(_this.map);
					
					_this.initLayerControl();
					_this.mapLoaded = true;
					$(".olControlPanZoomBar").css({"top":"65px"});
				
					_this.map.addLayers(_this.getMapLayers());
					_this.map.addLayer(dataLayer); 
					if( jda.app.resultsView.getCQLSearchString()!=null){
						_this.map.getLayersByName('cite:item - Tiled')[0].mergeNewParams({
							'CQL_FILTER' : jda.app.resultsView.getCQLSearchString()
						});
					}
					_this.map.getLayersByName('cite:item - Tiled')[0].events.register('loadstart','ok',function(){$('.jda-map-loader').show();});
					_this.map.getLayersByName('cite:item - Tiled')[0].events.register('loadend','ok',function(){$('.jda-map-loader').fadeOut('fast');});
					_this.initTimeSlider(_this.map);
				}
			);
		},
		
		startMapListeners : function(map){
			var _this = this;
			this.map.events.register('click', map, function(e){
			
		
			var params = {
				REQUEST : "GetFeatureInfo",
				EXCEPTIONS : "application/vnd.ogc.se_xml",
				BBOX : map.getExtent().toBBOX(),
				SERVICE : "WMS",
				VERSION : "1.1.1",
				X : e.xy.x,
				Y : e.xy.y,
				INFO_FORMAT : 'text/html',
				QUERY_LAYERS : 'cite:item',
				FEATURE_COUNT : 50,
				Layers : 'cite:item',
				WIDTH : map.size.w,
				HEIGHT : map.size.h,
				// format : format,
				styles : map.layers[map.layers.length-1].params.STYLES,
				srs : map.layers[map.layers.length-1].params.SRS,
				TILED : true
			};
			// merge filters
			if (map.getLayersByName('cite:item - Tiled')[0].params.CQL_FILTER != null) params.cql_filter = map.getLayersByName('cite:item - Tiled')[0].params.CQL_FILTER;
			if (map.getLayersByName('cite:item - Tiled')[0].params.FILTER != null) params.filter = map.getLayersByName('cite:item - Tiled')[0].params.FILTER;
			if (map.getLayersByName('cite:item - Tiled')[0].params.FEATUREID) params.featureid = map.getLayersByName('cite:item - Tiled')[0].params.FEATUREID;
			
			OpenLayers.loadURL( _this.geoUrl + "cite/wms", params, _this, _this.onMapClick, _this.onMapClick );
			_this.mapClickEvent = e;
			OpenLayers.Event.stop(e);
		});
		
		
		
		//Adding DRAG back in -- wasn't working for some reason...
		var dragcontrol = new OpenLayers.Control.DragPan({'map':this.map, 'panMapDone':function(xy){
			
	        if(this.panned) {
	            var res = null;
	            if (this.kinetic) {
	                res = this.kinetic.end(xy);
	            }
	            this.map.pan(
	                this.handler.last.x - xy.x,
	                this.handler.last.y - xy.y,
	                {dragging: !!res, animate: false}
	            );
	            if (res) {
	                var self = this;
	                this.kinetic.move(res, function(x, y, end) {
	                    self.map.pan(x, y, {dragging: !end, animate: false});
	                });
	            }
	            this.panned = false;
	        }
	        _this.userdragged  = true;
	        console.log(map.getCenter());
	            
	    }});
	    dragcontrol.draw();
	    map.addControl(dragcontrol);
	    dragcontrol.activate();
		

	},
		
		initLayerControl : function(){
			console.log("Initializing Layer Controls");
			_this=this;
	
			$("#layer-control").tabs();
			this.layerControlIsOut = false;
			
			
			//Probably better way to start layer Controls closed
			$("#layer-control-drawer-arrows").html("&lt;&lt;");
			$("#layer-control-drawer").animate({right : "-253px"}, 10);
			
			$("#layer-control-drawer-tab").click(function(){
				if (_this.layerControlIsOut){
					console.log("retract layer controls");
					$("#layer-control-drawer-arrows").html("&laquo;");
					$("#layer-control-drawer").animate({right : "-253px"}, 400);
				}else{
					console.log("expand layer controls");
					console.log($("#layer-control-drawer-arrows"));
					$("#layer-control-drawer-arrows").html("&raquo;");
					$("#layer-control-drawer").animate({right : "-25px"}, 400);
				}
				_this.layerControlIsOut = !_this.layerControlIsOut;
			})
		},
		
		onMapClick : function(response){
			var _this=this;
			if(this.popup) this.popup.destroy();
			if (response.responseText != ""){			
				try
				{
					//UGLY – remove header string
					//var data = jQuery.parseJSON(response.responseText.substring(75));
					//console.log(response.responseText);
					var d = response.responseText.replace(/(\r\n|\n|\r|\t)/gm," ");
					var data = jQuery.parseJSON(d);
				}
				catch(err)
				{
                                        console.log(err);
					this.popup=false;
					console.log('failure to parse json');
					return;
				}
			
				features = data["features"];
				features.shift();  //removes first item which is empty
			
				this.mapViewCollection = new Browser.Items.Collections.Views.MapPopup({ collection : new Browser.Items.Collection(features)});
			
				//Fix model ids (remove prepended "item.id")
				
				_.each(_.toArray(this.mapViewCollection.collection),function(model){
					var newid = model.get("id").split('.')[1];
					_this.mapViewCollection.collection.get(model.id).set({id:newid});
					
				});
				
				this.popup = new OpenLayers.Popup.FramedCloud( 
					"map-popup",
					this.map.getLonLatFromPixel(this.mapClickEvent.xy),
					this.map.size,
					$(_this.mapViewCollection.el).html(),
					null,
					true
				);
			
				//openlayers workaround, propogates click events to trigger fancybox
				this.popup.events.register("click", this.popup, function(event){ $(event.target).trigger('click') });
			
				this.map.addPopup(this.popup);
				$('.map-popup-list-items').css("margin-right","-40px");
				$('#map-popup').height($('#map-popup').height() - 50);	
			}
			else this.popup=false;
		},
		
		getMapLayers : function(){
	
			//JapanMap layers from data/map-layers.js
		
			_this = this;
			var layers = [];
			_.each(jdaMapLayers.layers,function(layer){
				 
				 if(sessionStorage.getItem('locale') == 'en') var title = layer.title; else var title = layer.titleJa;
				
				 $('#layer-checkboxes').append('<label class="checkbox">'+title+'<input type="checkbox" data-layer="'+layer.src+'" class="layer-checkbox" id="'+layer.id+'"/></label>');
				 $('#layer-legend').append('<div class="legend-entry hidden" id="'+layer.id+'-legend"><p>'+title+'</p></div>');
		
				layers.push( new OpenLayers.Layer.WMS(
					layer.id,
					_this.japanMapUrl + "wms",
					{
						layers : layer.src,
						format : layer.format,
						transparent : true,
						tiled : true
					},
					{
						singleTile : false,
						wrapDateLine : true,
						visibility : false,
						opacity : 0.3,
						buffer: 0,
									displayOutsideMaxExtent: true,
									isBaseLayer: false,
									yx : {'EPSG:900913' : false},
									'sphericalMercator': true,
									'maxExtent': new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
					})
				);
			});
			
			//Quick fix to allow last layer to be clickable
			
			$('#layer-checkboxes').append("<br><br>");
			
			
			$(".layer-checkbox").click(function(){
				_this.toggleMapLayer($(this).attr("id"),$(this).data("layer"));
			});
			return layers;
		},
			
		resetMapSize :function(){
			var h = Math.max($(window).height() - $('#zeega-event-view').offset().top,400);
			$("#event-map").height(h +20);
			$("#event-map,#zeega-event-view").width($(window).width());
			$('#zeega-results-count').offset( { top:$('#zeega-results-count').offset().top, left:10 } );
		},
		
		toggleMapLayer : function(id,layerId){
			 //set visibility of map layer
			this.map.getLayersByName(id)[0].setVisibility( $('#'+id).is(':checked'));
			if ( $("#"+id+"-legend").find("img").length == 0){
				$("#"+id+"-legend").append("<img src='http://worldmap.harvard.edu/geoserver/wms?TRANSPARENT=TRUE&EXCEPTIONS=application%2Fvnd.ogc.se_xml&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&LLBBOX=133.65533295554525,34.24189997810896,143.33901303676075,42.22959346742014&URL=http%3A%2F%2Fworldmap.harvard.edu%2Fgeoserver%2Fwms&TILED=true&TILESORIGIN=14878443.604346,4061329.7164352&LAYER="+layerId+"&FORMAT=image/gif&SCALE=1091958.1364361627'>");
			}		
			
			//toggle visibility of that legend item
			$("#"+id+"-legend").toggleClass("hidden");
		},
		
		/********** TIME SLIDER CODE ***********************/
		
		
		
		
		initTimeSlider : function(map){
			console.log("Initializing Time Slider");
			
			_this = this;
			if( !this.timesliderLoaded ){
				this.timeSliderLoaded = true;
				timeSliderContainer = $("#event-time-slider");
			
				//Put HTML into the div
				timesliderHTML = 
					"<div id='date-time-start' class='date-time-block pull-left'>" +
						"<input type='text' name='start-date' id='start-date' value='' class='date-picker'>" + 
						"<input type='text' name='start-time' id='start-time' value='' class='time-picker'>" +
					"</div>" +  
					"<div id='date-time-end' class='date-time-block pull-right'>" +
						"<input type='text' name='end-date' id='end-date' value='' class='date-picker'>" +
						"<input type='text' name='end-time' id='end-time' value='' class='time-picker'>" +
					"</div>" +
					"<div id='range-slider'></div>";
				timeSliderContainer.html(timesliderHTML);
				
				//add the jquery-ui date and time pickers and change handlers
				$('#start-time').timepicker({}).change(this.setStartDateTimeSliderHandle);
				$('#end-time').timepicker({}).change(this.setEndDateTimeSliderHandle);
				
				$('#start-date').datepicker({
					onSelect: function() {},
					dateFormat : 'MM d, yy',
					onClose : this.setStartDateTimeSliderHandle
				});
	
				$('#end-date').datepicker({
					onSelect: function() {},
					dateFormat : 'MM d, yy',
					onClose : this.setEndDateTimeSliderHandle
				});
				
				//Set up the range slider
				//times are seconds since jan 1 1970
				minTime = 1293840000;
				maxTime = 1330095357;
				//maxTime = 1293940000;      //short range for testing hours and minutes
				$("#range-slider").slider({
					range: true, 
					min: minTime, 
					max: maxTime,
					values: [minTime, maxTime],
					slide: function( event, ui )
					{
						if (ui.values[0]<ui.values[1]){
							_this.setStartDateTimeSliderBubble(ui.values[0]);
							_this.setEndDateTimeSliderBubble(ui.values[1]);
							return true;
						}
						else return false;
					},
					change : function(event, ui)
					{	
						_this.setStartDateTimeSliderBubble(ui.values[0]);
						_this.setEndDateTimeSliderBubble(ui.values[1]);
						 jda.app.resultsView.setStartAndEndTimes(ui.values[0], ui.values[1]);
						_this.updateMapForTimeSlider(map);
						_this.updateResultsCountForTimeSlider();
					 }
				});
				$("#range-slider").css("margin-left", $("#date-time-start").outerWidth());
				$("#range-slider").css("margin-right", $("#date-time-end").outerWidth());
				
				
				//Set the dateTime pickers to the starting slider condition
				this.setStartDateTimeSliderBubble($( "#range-slider" ).slider( "values", 0 ));
				this.setEndDateTimeSliderBubble($( "#range-slider" ).slider( "values", 1 ));
			}
		
		}, 

		
		updateResultsCountForTimeSlider : function(sliderUI, map){
			var searchView = jda.app.resultsView;
			$("#jda-related-tags, #jda-title, #zeega-results-count").fadeTo(100,0);
			searchView.collection.fetch({
				success : function(model, response){ 
					searchView.renderTags(response.tags);
					searchView.render();      
					$('#zeega-results-count-number').text(jda.app.addCommas(response["items_and_collections_count"]));        
					$('#zeega-results-count').fadeTo(100, 1);
				}
			});
		},
		
		updateMapForTimeSlider : function(map){
			 cqlFilterString = jda.app.resultsView.getCQLSearchString();
 	 			if( jda.app.resultsView.getCQLSearchString()!=null){
 					map.getLayersByName('cite:item - Tiled')[0].mergeNewParams({
 					'CQL_FILTER' : jda.app.resultsView.getCQLSearchString()
			     });
				 }
		},
		
		setStartDateTimeSliderHandle : function(){
			dateMillis = $("#start-date").datepicker('getDate').getTime();
			timeStrings = $("#start-time").val().split(':');
			h = timeStrings[0];
			m = timeStrings[1].split(' ')[0];
			timeMillis = h*60*60*1000 + m*60*1000;
			seconds = (dateMillis + timeMillis)/1000;
			oldValues =  $("#range-slider").slider( "option", "values" );
			$( "#range-slider" ).slider( "option", "values", [seconds, oldValues[1]] );
			jda.app.setStartDateTimeSliderBubble(seconds);
		},
		
		setEndDateTimeSliderHandle : function(){
			dateMillis = $("#end-date").datepicker('getDate').getTime();
			timeStrings = $("#end-time").val().split(':');
			h = timeStrings[0];
			m = timeStrings[1].split(' ')[0];
			timeMillis = h*60*60*1000 + m*60*1000;
			seconds = (dateMillis + timeMillis)/1000;
			oldValues =  $("#range-slider").slider( "option", "values" );
			$( "#range-slider" ).slider( "option", "values", [oldValues[0], seconds] );
			jda.app.setEndDateTimeSliderBubble(seconds);
		},
		
		setStartDateTimeSliderBubble : function(val){		
			//centerX = $("#range-slider a").first().position()["left"];
			//dateTimeWidth = $("#date-time-start").outerWidth();
			//$("#date-time-start").css("left", centerX);
			var d = new Date(val*1000);
			$("#start-date").val(d.format('mmmm d, yy'));
			$("#start-time").val(d.format("h:MM tt"));
		},
		
		setEndDateTimeSliderBubble : function(val){
			//handleWidth =  $("#range-slider a").last().outerWidth();
			//centerX = $("#range-slider a").last().position()["left"];
			//dateTimeWidth = $("#date-time-end").width();
			//$("#date-time-end").css("left", centerX + dateTimeWidth + handleWidth/2);
			var d = new Date(val*1000);
			$("#end-date").val(d.format('mmmm d, yy'));
			$("#end-time").val(d.format("h:MM tt"));
		},
	

	
	
	});


	})(jda.module("browser"));
