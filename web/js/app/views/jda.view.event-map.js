(function(Browser) {


	Browser.Views = Browser.Views || {};

	Browser.Views.EventMap = Backbone.View.extend(
		{

		tagName : 'div',
		className: 'event-map',
		minTime : 1293840000,
		maxTime : (new Date().getTime() / 1000),
		mapLoaded : false,
		timeSliderLoaded : false,
		japanMapUrl : sessionStorage.getItem("japanMapUrl"),
		geoUrl : sessionStorage.getItem("geoServerUrl"),
		initialize : function()
		{

			OpenLayers.Layer.Grid.newRatio = 1.5;

			OpenLayers.Layer.Grid.prototype.setTileSize = function(size) {
				if (this.singleTile) {
					size = this.map.getSize();
					var curWidth = parseInt(size.w * this.ratio,10);
					var targetWidth = curWidth +  (16 - (curWidth % 16));
					this.newRatio = targetWidth/size.w;
					size.h = parseInt(Math.round(size.h * this.newRatio),10);
					size.w = parseInt(Math.round(size.w * this.newRatio),10);
				}
				OpenLayers.Layer.HTTPRequest.prototype.setTileSize.apply(this, [size]);
			};

			OpenLayers.Layer.Grid.prototype.initSingleTile = function(bounds) {

				//determine new tile bounds
				var center = bounds.getCenterLonLat();
				var tileWidth = (bounds.getWidth() * this.newRatio);
				var tileHeight = bounds.getHeight() * this.newRatio;

				var tileBounds =
						new OpenLayers.Bounds(center.lon - (tileWidth/2),
								center.lat - (tileHeight/2),
								center.lon + (tileWidth/2),
								center.lat + (tileHeight/2));

				var px = this.map.getLayerPxFromLonLat({
					lon: tileBounds.left,
					lat: tileBounds.top
				});

				if (!this.grid.length) {
					this.grid[0] = [];
				}

				var tile = this.grid[0][0];
				if (!tile) {
					tile = this.addTile(tileBounds, px);

					this.addTileMonitoringHooks(tile);
					tile.draw();
					this.grid[0][0] = tile;
				} else {
					tile.moveTo(tileBounds, px);
				}

				//remove all but our single tile
				this.removeExcessTiles(1,1);

				// store the resolution of the grid
				//this.gridResolution = this.getServerResolution();
			};
		},

		events : {

		},

		render : function( )
		{
			return this.el;
		},

		load : function(){
			this.resetMapSize();
			$('.olPopup').remove();

			if( !this.mapLoaded ) this.initMap();
			else if( jda.app.resultsView.getSQLSearchString()!==null){

				this.map.getLayersByName('cite:item - Tiled')[0].mergeNewParams({
						'SQL' : jda.app.resultsView.getSQLSearchString()
					});
				this.initTimeSlider();
			}
			else{
				this.initTimeSlider();
			}
		},

		initMap : function(){
			console.log("Initializing Map");

			OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
			OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;

			var _this=this;
			wax.tilejson('http://api.tiles.mapbox.com/v3/jdarchive.he805gp4.json',
				function(tilejson) {
					var baseLayer =  wax.ol.connector(tilejson);
					_this.map = new OpenLayers.Map('event-map',{

						//controls: [ new OpenLayers.Control.PanZoomBar()],
						controls: [new OpenLayers.Control.ZoomPanel(),new OpenLayers.Control.Navigation()],
						layers: [baseLayer],
						maxResolution: 1.3053327578125,
						projection: "EPSG:900913",
						units: 'm'

					});

					var dataLayer =  new OpenLayers.Layer.WMS(
						"cite:item - Tiled",
						_this.geoUrl + "?LAYERS=point&",
							{

								'SQL' : function(){ return this.resultsView.getSQLSearchString(); },
								BBOX: '',
								WIDTH : 250,
								HEIGHT : 250,
								RADIUS : 2,
								R : 255,
								G : 0,
								B : 0
							},
							{
								buffer: 0,
								singleTile: true,
									displayOutsideMaxExtent: true,
									isBaseLayer: false,
									yx : {'EPSG:900913' : false},
									'sphericalMercator': true,
									'maxExtent': new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34)

							}
					);


					var proj = new OpenLayers.Projection("EPSG:4326");

					_this.map.setCenter(new OpenLayers.LonLat(140.652466, 38.052417).transform(proj, _this.map.getProjectionObject()), 9);
					_this.startMapListeners( _this.map );

					_this.initLayerControl();
					_this.mapLoaded = true;
					$(".olControlPanZoomBar").css({"top":"65px"});

					_this.map.addLayers(_this.getMapLayers());

          // merge in new params before adding the layer
          dataLayer.mergeNewParams({'SQL' : jda.app.resultsView.getSQLSearchString()});
					_this.map.addLayer(dataLayer);

					_this.map.addControl(new OpenLayers.Control.Attribution());
					_this.map.getLayersByName('cite:item - Tiled')[0].events.register('loadstart','ok',function(){$('.jda-map-loader').show();});
					_this.map.getLayersByName('cite:item - Tiled')[0].events.register('loadend','ok',function(){$('.jda-map-loader').fadeOut('fast');});
					_this.initTimeSlider(_this.map);
				}
			);
		},

		startMapListeners : function(map){
			var _this = this;
			this.map.events.register('click', map, function(e){
				var event=e;
				var lonlat =map.getLonLatFromViewPortPx(e.xy).transform(_this.map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));
				var mapSelections =  new Browser.Items.MapCollection([],{SQL:jda.app.resultsView.getSQLSearchString(lonlat.lon,lonlat.lat)});
				$('.olPopup').remove();
				mapSelections.fetch({success:function(response,collection){

						_this.mapViewCollection = new Browser.Items.Collections.Views.MapPopup({ collection : mapSelections});


						_this.popup = new OpenLayers.Popup.FramedCloud(
							"map-popup",
							_this.map.getLonLatFromPixel(event.xy),
							_this.map.size,
							$(_this.mapViewCollection.el).html(),
							null,
							true
						);

						//openlayers workaround, propogates click events to trigger fancybox
						_this.popup.events.register("click", _this.popup, function(event){ $(event.target).trigger('click'); });

						_this.map.addPopup(_this.popup);
						$('.map-popup-list-items').css("margin-right","-40px");
						$('#map-popup').height($('#map-popup').height() - 50);
					}
				});




				return false;


		});






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
			});
		},


		getMapLayers : function(){

			//JapanMap layers from data/map-layers.js

			_this = this;
			var layers = [];
			_.each(jdaMapLayers.layers,function(layer){
				var title;
				if(sessionStorage.getItem('locale') == 'en') title = layer.title;
				else title = layer.titleJa;

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
									'maxExtent': new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34)
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
			if ( $("#"+id+"-legend").find("img").length === 0){
				$("#"+id+"-legend").append("<img src='http://worldmap.harvard.edu/geoserver/wms?TRANSPARENT=TRUE&EXCEPTIONS=application%2Fvnd.ogc.se_xml&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&LLBBOX=133.65533295554525,34.24189997810896,143.33901303676075,42.22959346742014&URL=http%3A%2F%2Fworldmap.harvard.edu%2Fgeoserver%2Fwms&TILED=true&TILESORIGIN=14878443.604346,4061329.7164352&LAYER="+layerId+"&FORMAT=image/gif&SCALE=1091958.1364361627'>");
			}

			//toggle visibility of that legend item
			$("#"+id+"-legend").toggleClass("hidden");
		},

		/********** TIME SLIDER CODE ***********************/



		initTimeSlider : function(map){
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

				var start,end;

				if(!_.isNull(jda.app.searchObject.times)&&!_.isUndefined(jda.app.searchObject.times)&&!_.isUndefined(jda.app.searchObject.times.start)&&!_.isUndefined(jda.app.searchObject.times.end)){
					start=jda.app.searchObject.times.start;
					end=jda.app.searchObject.times.end;
				}
				else{
					start=this.minTime;
					end= this.maxTime;
				}

				$("#range-slider").slider({
					range: true,
					min: this.minTime,
					max: this.maxTime,
					values: [start, end],
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

						jda.app.searchObject.times = {
							start:ui.values[0],
							end:ui.values[1]
							};
						jda.app.updateURLHash(jda.app.searchObject);
						jda.app.search(jda.app.searchObject);

					}
				});

				$("#range-slider").css("margin-left", $("#date-time-start").outerWidth());
				$("#range-slider").css("margin-right", $("#date-time-end").outerWidth());


				//Set the dateTime pickers to the starting slider condition
				this.setStartDateTimeSliderBubble($( "#range-slider" ).slider( "values", 0 ));
				this.setEndDateTimeSliderBubble($( "#range-slider" ).slider( "values", 1 ));
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
			this.setStartDateTimeSliderBubble(seconds);
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
			this.setEndDateTimeSliderBubble(seconds);
		},

		setStartDateTimeSliderBubble : function(val){
			var d = new Date(val*1000);
			$("#start-date").val(d.format('mmmm d, yy'));
			$("#start-time").val(d.format("h:MM tt"));
		},

		setEndDateTimeSliderBubble : function(val){
			var d = new Date(val*1000);
			$("#end-date").val(d.format('mmmm d, yy'));
			$("#end-time").val(d.format("h:MM tt"));
		}
	});


	})(jda.module("browser"));
