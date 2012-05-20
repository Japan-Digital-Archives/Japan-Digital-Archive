

// This contains the module definition factory function, application state,
// events, and the router.
this.jda = {
	// break up logical components of code into modules.
	module: function()
	{
		// Internal module cache.
		var modules = {};

		// Create a new module reference scaffold or load an existing module.
		return function(name) 
		{
			// If this module has already been created, return it
			if (modules[name]) return modules[name];

			// Create a module and save it under this name
			return modules[name] = { Views: {} };
		};
	}(),

  // Keep active application instances namespaced under an app object.
  app: _.extend({
	apiLocation : sessionStorage.getItem("apiUrl"),
	currentView : 'list',
	mapLoaded : false,
	timeSliderLoaded : false,
	japanMapUrl : sessionStorage.getItem("japanMapUrl"),
	geoUrl : sessionStorage.getItem("geoServerUrl"),
	resultsPerPage : 100,
	
	init : function()
	{
		// Include all modules

		var Items = jda.module("items");
		// make item collection
		this.itemViewCollection = new Items.ViewCollection();
	},
	
	search : function(params, useValuesFromURL)
	{
		console.log('search');
		console.log(params);
		console.log(useValuesFromURL);
		console.log('search done');
		
		//Parse out search box values for putting them in the Search query
		if (useValuesFromURL)
		{
			//get the search query from URL and put it in the search box
			this.updateSearchUI(params);
			console.log('from url');
			console.log(params)
		}
		else
		{
			//Use content value from format dropdown
			console.log('new search')
			console.log(params)
			params.content = $('#content').val();

			//Parse searchbox values
			var facets = VisualSearch.searchQuery.models;
			console.log(facets)
			
			var tagQuery = "tag:";
			var textQuery = "";

			_.each(facets, function(facet){
				
				switch ( facet.get('category') )
				{
					case 'text':
						textQuery = (textQuery.length > 0) ? textQuery + " AND " + facet.get('value') : facet.get('value'); 
						break;
					case 'tag':
						tagQuery = (tagQuery.length > 4) ? tagQuery + ", " + facet.get('value') : tagQuery + facet.get('value');
						break;
					
			    }
			});
			params.q = textQuery + (textQuery.length > 0 && tagQuery.length > 4 ? " " : "") + (tagQuery.length > 4 ? tagQuery : ""); 
			params.viewType = this.currentView;
			console.log(params)
		
		}
		
		if (!_.isUndefined(params.view_type))  this.switchViewTo(params.view_type,false) ;
		
		if (params.view_type == 'event')
		{
			this.setEventViewTimePlace(params);
		}
		this.itemViewCollection.search( params );
		
		
		if (this.currentView == 'event')
		{
			if(!_.isUndefined( this.itemViewCollection.getCQLSearchString())&&this.mapLoaded)
			{
				this.map.layers[1].mergeNewParams({
					'CQL_FILTER' : this.itemViewCollection.getCQLSearchString()
				});
			}
		}
		
	},
	
	
	
	updateSearchUI : function(obj)
	{
		var q = obj.q;
		if (!_.isUndefined(q))
		{
			//check for tags
			if (q.indexOf("tag:") >=0){
				var tagPart = q.substr(q.indexOf("tag:") + 4);
				var tagNames = tagPart.split(" ");
				for(var i=0;i<tagNames.length;i++)
				{
					var tagName = tagNames[i];
					VisualSearch.searchBox.addFacet('tag', tagName, 0);
				}
			}
			//check for text
			var textPart = q.indexOf("tag:") >= 0 ? q.substr(0,  q.indexOf("tag:")) : q;
			if (textPart.length > 0)
			{
				var texts = textPart.split(",");
				for(var i=0;i<texts.length;i++)
				{
					var text = texts[i];
					VisualSearch.searchBox.addFacet('text', text, 0);
				}
			}
			
		}
		if (!_.isUndefined(obj.content)){
			$('#content').val(obj.content);
			$('#select-wrap-text').text( $('#content option[value=\''+$('#content').val()+'\']').text() );
		}
		
	},
	
	 setEventViewTimePlace : function(obj)
	{
		if (!_.isUndefined(obj.start))
		{
			oldValues =  $("#range-slider").slider( "option", "values" );
			$( "#range-slider" ).slider( "option", "values", [obj.start, oldValues[1]] );
		}
		if (!_.isUndefined(obj.end))
		{
			oldValues =  $("#range-slider").slider( "option", "values" );
			$( "#range-slider" ).slider( "option", "values", [oldValues[0], obj.end]);
		}
		if (!_.isUndefined(obj.map_bounds))
		{
			coords = (obj.map_bounds).split(',');
			bounds = new OpenLayers.Bounds(coords[0], coords[1], coords[2], coords[3]);
			this.map.zoomToExtent(bounds);
		}
 	},
	
	resetMapSize :function(){
		var h = Math.max($(window).height() - $('#zeega-event-view').offset().top,400);
		$("#event-map").height(h +20);
		$("#event-map,#zeega-event-view").width($(window).width());
		$('#zeega-results-count').offset( { top:$('#zeega-results-count').offset().top, left:10 } );
	},
	
	
	switchViewTo : function( view , refresh )
	{
		$('.tab-pane').removeClass('active');

		this.itemViewCollection.setView(view);
		if( view != this.currentView )
		{
			//$('#'+this.currentView+'-view').hide();
			this.currentView = view;
			$('#zeega-'+view+'-view').addClass('active');
			
 	 		//$(this).hide();
			switch( this.currentView )
			{
				case 'list':
					this.showListView();
					break;
				case 'event':
					this.showEventView();
					break;
				case 'thumb':
					this.showThumbnailView();
					break;
				default:
					console.log('view type not recognized')
			}
			if(refresh){
				$('#zeega-results-count').fadeOut('fast');
				var searchView=this.itemViewCollection;
				searchView.collection.fetch({
					success : function(model, response){ 
						searchView.renderTags(response.tags);
						searchView.render();      
						$('#zeega-results-count-number').text(jda.app.addCommas(response["items_count"]));        
						$('#zeega-results-count').fadeTo(100, 1);
					}
				});
			}
		}
	},
	addCollectionFilter : function(model){
		var Items = jda.module("items");
		this.clearSearchFilters();
		this.itemViewCollection.collectionFilter = new Items.Views.CollectionPage({model:model});
		this.search({'page':1, 'collection':model.id});

	},
	removeCollectionFilter : function(){
		
		//remove search parameter from JDA app
		this.search({'collection':''});

		//remove collectionFilter view which takes care of UI
		this.itemViewCollection.collectionFilter.remove();

		//set filter to null
		this.itemViewCollection.collectionFilter = null;

	},
	addCommas : function(nStr)
	{
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	},
	
	showListView : function()
	{
		console.log('switch to List view');

		
		//Time slider disabled for now
		//$('#event-time-slider').hide();
		$('#zeega-results-count').removeClass('zeega-results-count-event');
		$('#zeega-results-count').css('left', 0);
		$('#zeega-results-count').css('z-index', 0);

		//loop through all facets to find the data & time one
		_.each( VisualSearch.searchBox.facetViews, function( facet ){
			if( facet.model.get('category') == 'data:time & place' ) facet.remove();
		})
		
		if(this.itemViewCollection.updated)
		{
			console.log('render collection')
			this.itemViewCollection.render();
		}
		
	},
	showThumbnailView : function()
	{
		$('#zeega-results-count').removeClass('zeega-results-count-event');
		$('#zeega-results-count').css('left', 0);
		$('#zeega-results-count').css('z-index', 0);

		//loop through all facets to find the data & time one
		_.each( VisualSearch.searchBox.facetViews, function( facet ){
			if( facet.model.get('category') == 'data:time & place' ) facet.remove();
		})
		
		if(this.itemViewCollection.updated)
		{
			console.log('render collection')
			this.itemViewCollection.render();
		}
	},
	showEventView : function()
	{
		console.log('switch to Event view');
		//For some reason, the map collapses after a search to 0px width
		
		//Time slider disabled for now
		//$('#event-time-slider').show();
		$('#zeega-results-count').addClass('zeega-results-count-event');
		$('#zeega-results-count').offset( { top:$('#zeega-results-count').offset().top, left:10 } );
		$('#zeega-results-count').css('z-index', 1000);

		
		VisualSearch.searchBox.addFacet('data:time & place', ' ', 0);
		_.each( VisualSearch.searchBox.facetViews, function( facet ){
			if( facet.model.get('category') == 'tag' ) {
				var facetValue = facet.model.get('value');
				facet.model.set({'value': null });
				facet.remove();
				$('#removed-tag-name').text(facetValue);
				$('#remove-tag-alert').show('slow');
				setTimeout(function() {
				  $('#remove-tag-alert').hide('slow');
				}, 3000);
			}
			if (facet.model.get("category")=="data:time & place") {
    			$(facet.el).find('.VS-icon-cancel').click(function(){
    				jda.app.switchViewTo('list');
    			});
    		}
		})
		
		$("#zeega-event-view").width($(window).width());
		this.resetMapSize();

		if( !this.mapLoaded ) this.initWorldMap();
		else if( this.itemViewCollection.getCQLSearchString()!=null){
				
				this.map.layers[1].mergeNewParams({
						'CQL_FILTER' : this.itemViewCollection.getCQLSearchString()
					});
		 }
		console.log('map loaded')
	},
	
	initWorldMap : function()
	{
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
							//'CQL_FILTER' : function(){ return this.itemViewCollection.getCQLSearchString() },
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
					layers: [baseLayer,dataLayer],
                    maxResolution: 1.3053327578125,
                    projection: "EPSG:900913",
                    units: 'm'
			
				});
				
				if( _this.itemViewCollection.getCQLSearchString()!=null){
					_this.map.layers[1].mergeNewParams({
						'CQL_FILTER' : _this.itemViewCollection.getCQLSearchString()
					});
				}
				
				
				_this.map.addLayers(_this.getMapLayers());
			
				var proj = new OpenLayers.Projection("EPSG:4326");
				_this.map.setCenter(new OpenLayers.LonLat(140.652466, 38.052417).transform(proj, _this.map.getProjectionObject()), 9);
			
				_this.startMapListeners( _this.map );
				
				_this.initTimeSlider(_this.map);
				_this.initLayerControl();
				_this.mapLoaded = true;
				$(".olControlPanZoomBar").css({"top":"65px"});
		
			});
	},
	
	startMapListeners : function(map)
	{
		var _this = this;
		this.map.events.register('click', map, function(e){
			
			console.log('clicked');
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
				styles : map.layers[1].params.STYLES,
				srs : map.layers[1].params.SRS,
				TILED : true
			};
			// merge filters
			if (map.layers[1].params.CQL_FILTER != null) params.cql_filter = map.layers[1].params.CQL_FILTER;
			if (map.layers[1].params.FILTER != null) params.filter = map.layers[1].params.FILTER;
			if (map.layers[1].params.FEATUREID) params.featureid = map.layers[1].params.FEATUREID;
			
			OpenLayers.loadURL( _this.geoUrl + "cite/wms", params, _this, _this.onMapClick, _this.onMapClick );
			_this.mapClickEvent = e;
			OpenLayers.Event.stop(e);
		});
		
		$(".layer-checkbox").click(function(){
			_this.toggleMapLayer($(this).attr("id"), map);
			_this.toggleLegendEntry($(this).attr("id"), map);
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
	
	showTagView : function()
	{
		console.log('switch to Tag view');
		
	},
	
	initTimeSlider : function(map)
	{
	/*console.log("Initializing Time Slider");
	_this = this;
	if( !this.timesliderLoaded )
		{
			this.timeSliderLoaded = true;
			timeSliderContainer = $("#event-time-slider");
			
			//Put HTML into the div
			timesliderHTML = 
				"<div id='date-time-start' class='date-time-block'>" +
					"<input type='text' name='start-date' id='start-date' value='' class='date-picker'>" + 
					"<input type='text' name='start-time' id='start-time' value='' class='time-picker'>" +
				"</div>" +  
				"<div id='date-time-end' class='date-time-block'>" +
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
					_this.itemViewCollection.setStartAndEndTimes(ui.values[0], ui.values[1]);
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
		*/
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

	//disabling time slider for the moment
	updateResultsCountForTimeSlider : function(sliderUI, map){
		/*var searchView = this.itemViewCollection;
		//$("#jda-related-tags, #jda-
		-title, #zeega-results-count").fadeTo(100,0);
		searchView.collection.fetch({
			success : function(model, response){ 
				searchView.renderTags(response.tags);
				searchView.render();      
				$('#zeega-results-count-number').text(jda.app.addCommas(response["items_count"]));        
				$('#zeega-results-count').fadeTo(100, 1);
			}
		});*/
 	},
	updateMapForTimeSlider : function(map){
		console.log("UP");
		 //Time filter string    
		 cqlFilterString = this.itemViewCollection.getCQLSearchString();
		 if(!_.isUndefined(cqlFilterString))
		 {
		 	map.layers[1].mergeNewParams({
		   		'CQL_FILTER' : cqlFilterString
			});
		 }
   	},
   	
	setStartDateTimeSliderHandle : function()
	{
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
	
	setEndDateTimeSliderHandle : function()
	{
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
	
	setStartDateTimeSliderBubble : function(val)
	{		
		centerX = $("#range-slider a").first().position()["left"];
		dateTimeWidth = $("#date-time-start").outerWidth();
		$("#date-time-start").css("left", centerX);
		var d = new Date(val*1000);
		$("#start-date").val(d.format('mmmm d, yy'));
		$("#start-time").val(d.format("h:MM tt"));
	},
	
	setEndDateTimeSliderBubble : function(val)
	{
		handleWidth =  $("#range-slider a").last().outerWidth();
		centerX = $("#range-slider a").last().position()["left"];
		dateTimeWidth = $("#date-time-end").width();
		$("#date-time-end").css("left", centerX + dateTimeWidth + handleWidth/2);
		var d = new Date(val*1000);
		$("#end-date").val(d.format('mmmm d, yy'));
		$("#end-time").val(d.format("h:MM tt"));
	},

	//NOTE - this does not search, it only clears out all the filters on the page
	clearSearchFilters : function(){
	
		

    	//clear out the content filter
    	$('#content').val("all");
    	$('#select-wrap-text').text( $('#content option[value=\''+$('#content').val()+'\']').text() );

    	//remove search box values
    	VisualSearch.searchBox.disableFacets();
	    VisualSearch.searchBox.value('');
	  	VisualSearch.searchBox.flags.allSelected = false;

        
	},
	
	
	toggleLegendEntry :  function(checkboxID, map)
	{
		switch(checkboxID)
		{
			case "municipal-layer":
				layer = "geonode:Admin_Dissolve_Test2_JOB";
				legendID = "municipal-legend";
				break;
			case "radiation-layer":			
				layer = "geonode:rad_may11_contours_final_cgl";
				legendID = "radiation-legend";
				break;
			case "casualties-layer":			
				layer =  "geonode:Slct_Casualty2010Join1_Final_zDe";
				legendID = "casualties-legend";
				break;
			case "flooding-layer":			
				layer =  "geonode:japan8m_ezt";
				legendID = "flooding-legend";
				break;
			case "shake-layer":
				layer ="geonode:InstruIntensity_Clip_dOd";
				legendID = "shake-legend";
				break;
			case "pop-density-layer":
				layer ="geonode:_popcensus2_2id";
				legendID = "pop-density-legend";
				break;
		}
		
		//If the image hasn't been loaded yet, do so
		if ( $("#"+legendID).find("img").length == 0)
		{
			legendString = "http://worldmap.harvard.edu/geoserver/wms?TRANSPARENT=TRUE&EXCEPTIONS=application%2Fvnd.ogc.se_xml&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&LLBBOX=133.65533295554525,34.24189997810896,143.33901303676075,42.22959346742014&URL=http%3A%2F%2Fworldmap.harvard.edu%2Fgeoserver%2Fwms&TILED=true&TILESORIGIN=14878443.604346,4061329.7164352&LAYER="+layer+"&FORMAT=image/gif&SCALE=1091958.1364361627";
			$("#"+legendID).append("<img src='" + legendString + "'>");
		}		
		//toggle visibility of that legend item
		$("#"+legendID).toggleClass("hidden");

	},
	
	toggleMapLayer : function(checkboxID, map)
	{
		//map layer names are the same as checkbox id's
		var isChecked = $('#'+checkboxID).is(':checked');
		var layer = map.getLayersByName(checkboxID)[0];
		layer.setVisibility(isChecked);
	},
	
	onLegendLoad : function(response)
	{
		console.log(response);
	},
	
	onMapClick : function(response)
	{
		
		//remove existing popups.
		if(this.popup)this.popup.destroy();
		
		if (response.responseText != "")
		{
			var Items = jda.module("items");
			
			try
			{
                            var data = eval('(' + response.responseText.substring(75) + ')');
			}
			catch(err)
			{
			  	console.log(response);
				this.popup=false;
			  	console.log('failure to parse json');
				return;
			}
			
			features = data["features"];
			features.shift();  //removes first item which is empty
	
			jda.app.mapViewCollection = new Items.MapPoppupViewCollection({ collection : new Items.Collection(features)});
			
			//Fix model ids (remove prepended "item.id")
			_.each(_.toArray(jda.app.mapViewCollection.collection),function(model){
				var newid = model.get("id").split('.')[1];
				jda.app.mapViewCollection.collection.get(model.id).set({id:newid});
				
			});
			
			this.popup = new OpenLayers.Popup.FramedCloud( 
				"map-popup",
				this.map.getLonLatFromPixel(this.mapClickEvent.xy),
				this.map.size,
				$(jda.app.mapViewCollection.el).html(),
				null,
				true
			);
			
			//openlayers workaround, propogates click events to trigger fancybox
			this.popup.events.register("click", this.popup, function(event){ $(event.target).trigger('click') });
			
			this.map.addPopup(this.popup);
			$('#map-popup').height($('#map-popup').height() - 50);	
			
			
		}
		else this.popup=false;
		
	},
	
	getMapLayers : function()
	{
		_this = this;
		var layers = [];		
		
		if(true)
		{
			/*
			layers.push(new OpenLayers.Layer.WMS(
				"cite:item - tiled",
				this.geoUrl + "cite/wms",
				{
					layers : 'cite:item',
					tiled: true,
					transparent : true,
					format : 'image/png',
					tiled: true
				}
			));
			*/

			
			
			
			//JapanMap layers.  For more layers, it will make sense to load these only when needed.
			layers.push( new OpenLayers.Layer.WMS(
				"municipal-layer",
				this.japanMapUrl + "wms",
				{
					layers : "geonode:Admin_Dissolve_Test2_JOB",
					format : 'image/png',
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
			
			layers.push( new OpenLayers.Layer.WMS(
				"radiation-layer",
				this.japanMapUrl + "wms",
				{
					layers : "geonode:rad_may11_contours_final_cgl",
					format : 'image/png',
					transparent : true,
					tiled : true,
				},
				{
					singleTile : false,
					wrapDateLine : true,
					visibility : false,
					buffer: 0,
								displayOutsideMaxExtent: true,
								isBaseLayer: false,
								yx : {'EPSG:900913' : false},
								'sphericalMercator': true,
								'maxExtent': new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
				})
			);
		
			layers.push(new OpenLayers.Layer.WMS(
				"casualties-layer",
				this.japanMapUrl + "wms",
				{
					layers : "geonode:Slct_Casualty2010Join1_Final_zDe",
					format : 'image/png',
					transparent : true,
					tiled : true
				},
				{
					singleTile : false,
					wrapDateLine : true,
					visibility : false,
					opacity : 0.5,
					buffer: 0,
								displayOutsideMaxExtent: true,
								isBaseLayer: false,
								yx : {'EPSG:900913' : false},
								'sphericalMercator': true,
								'maxExtent': new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
				})
			);
		
	
			
			layers.push( new OpenLayers.Layer.WMS(
				"shake-layer",
				this.japanMapUrl + "wms",
				{
					layers : "geonode:InstruIntensity_Clip_dOd",
					format : 'image/png',
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
		
			layers.push( new OpenLayers.Layer.WMS(
				"flooding-layer",
				this.japanMapUrl + "wms",
				{
					layers : "geonode:japan8m_ezt",
					format : 'image/png',
					transparent : true,
					tiled : true
				},
				{
					singleTile : false,
					wrapDateLine : true,
					visibility : false,
					buffer: 0,
								displayOutsideMaxExtent: true,
								isBaseLayer: false,
								yx : {'EPSG:900913' : false},
								'sphericalMercator': true,
								'maxExtent': new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
				})
			);

			layers.push( new OpenLayers.Layer.WMS(
				"pop-density-layer",
				this.japanMapUrl + "wms",
				{
					layers : "geonode:_popcensus2_2id",
					format : 'image/png',
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
			
		}
		
		return layers;
	}
	
}, Backbone.Events)


};
