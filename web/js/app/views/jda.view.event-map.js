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
		solrHeatmapUrl : sessionStorage.getItem("solrHeatmapUrl"),

		    initializeLayers : function()
		    {
			// create layers for heatmap cells and heatmap documents once and reuse
			if (this.map)
			{
			    var oldLayers = this.map.getLayersByName("HeatmapCellsLayer");
			    if (oldLayers.length > 0)
				this.map.removeLayer(oldLayers[0]);
			    oldLayers = this.map.getLayersByName("HeatmapDocumentsLayer");
			    if (oldLayers.length > 0)
				this.map.removeLayer(oldLayers[0]);
			}
			this.heatmapCellsLayer = new Heatmap.Layer("HeatmapCellsLayer");
			this.heatmapCellsLayer.setVisibility(false);

			// Create a style map for painting the features.
			// The graphicName property of the symbolizer is evaluated using
			// the type attribute on each feature (set above).
			var styles = new OpenLayers.StyleMap({
			    "default": {
				graphicName: "circle",
				pointRadius: 5,
				strokeColor: "red",
				strokeWidth: 1,
				fillColor: "red",
				fillOpacity: 1.
			    },
			    "select": {
				pointRadius: 10,
				fillOpacity: 1,
				rotation: 45
			    }
			});
			var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
			renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

			this.heatmapDocumentsLayer = new OpenLayers.Layer.Vector("HeatmapDocumentsLayer", {
			    styleMap: styles,
			    isBaseLayer: false,
			    renderers: renderer
			});

			this.heatmapDocumentsLayer.setVisibility(false);

			if (this.map)
			{
			    this.map.addLayer(this.heatmapCellsLayer);
			    this.map.addLayer(this.heatmapDocumentsLayer);
			}
		    },

		initialize : function()
		{
		    foo = this;
		    this.initializeLayers();
			OpenLayers.Layer.Grid.newRatio = 1.5;

			OpenLayers.Layer.Grid.prototype.setTileSize = function(size) {
				if (this.singleTile) {
					size = this.map.getSize();
					var curWidth = parseInt(size.w * this.ratio,10);
					var targetWidth = curWidth +  (16 - (curWidth % 16));
					this.newRatio = targetWidth/size.w;
					size.h = parseInt(Math.round(size.h * this.newRatio),10);
					size.w = parseInt(Math.round(size.w * this.nezwRatio),10);
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

		    var _this = this;

			this.resetMapSize();
			$('.olPopup').remove();

			if( !this.mapLoaded ) this.initMap();
			else if( jda.app.resultsView.getSQLSearchString()!==null){

				//this.map.getLayersByName('cite:item - Tiled')[0].mergeNewParams({
				//		'SQL' : jda.app.resultsView.getSQLSearchString()
				//	});
				this.initTimeSlider();
			    this.sendSolrRequest();
			    console.log('in EventMap.load, sql = ', jda.app.resultsView.getSQLSearchString());
			}
			else{
				this.initTimeSlider();
			        this.sendSolrRequest();
			}

		},

		    getMediaFilter : function()
		    {
			var searchParams = jda.app.resultsView.getSearch();
			var mediaFilter = "layer_type:*";
			var mediaType = searchParams.media_type;
			if (mediaType)
			{
			    var field = "layer_type:";
			    var media = mediaType;
			    if (mediaType.startsWith("-"))
			    {
				field = "-" + field;
				media = media.substr(1);
			    }
			    mediaFilter = field + media;
			}
			return mediaFilter;
		    },

		    getTimeFilter : function()
		    {
			var dates = this.getDatesIso();
			var timeFilter = "media_date_created:[" + dates[0] + " TO " + dates[1] + "}";
			return timeFilter;
		    },

		    getSearchQuery : function()
		    {
			var searchParams = jda.app.resultsView.getSearch();
			var query = "*:*";
			if (searchParams.q)
			{
			    query = "text:" + searchParams.q + "";
			}
			return query;
		    },

		    sendSolrRequest : function()
		    {
			var _this = this;
			var searchParams = jda.app.resultsView.getSearch();
			var query = this.getSearchQuery(); //"*:*";
			var mediaFilter = this.getMediaFilter(); //"layer_type:*";
			var timeFilter = this.getTimeFilter();
			var solrUrl = this.solrHeatmapUrl + "fq=" + mediaFilter + "&fq=" + timeFilter + "&rows=100";
			var solrDistErrPct = 0.10;  // default 0.15
			var zoomLevel = this.map.getZoom();
			if (zoomLevel <= 3)
			    solrDistErrPct = 0.14;
			jQuery.ajax({
			    url: solrUrl,
			    dataType: 'JSONP',
			    data: {
				q: query,
				wt: 'json',
				facet: true,
				'facet.heatmap': "bbox_rpt",
				'facet.heatmap.distErrPct': solrDistErrPct,
				'facet.heatmap.geom': this._mapViewToWkt(this.map),
				fq: "bbox_rpt"  + this._mapViewToEnvelope(this.map),  // other filters set above
				fl: "bbox_rpt" 
			    },
			    jsonp: 'json.wrf',
			    success: function(data) {
				var solrResponse = data;
				_this.processSolrResult(solrResponse);
			    }
			});
		    },

		    processSolrResult : function(solrResponse) 
		    {
			// first, check for outdated response that doesn't match current map
			var heatmapGeom = solrResponse.responseHeader.params["facet.heatmap.geom"];
			var viewWkt = this._mapViewToWkt(this.map);
			if (heatmapGeom !== viewWkt) return;

			var oldLayers = this.map.getLayersByName("HeatmapCellsLayer");
			if (oldLayers.length == 0)
			    this.map.addLayer(this.heatmapCellsLayer);
			oldLayers = this.map.getLayersByName("HeatmapDocumentsLayer");
			if (oldLayers.length == 0)
			    this.map.addLayer(this.heatmapDocumentsLayer);
			//if (oldLayers.length > 0)
			//    this.map.removeLayer(oldLayers[0]);
			var count = new Number(solrResponse.response.numFound);
			jQuery("#zeega-results-count-number").text(count.toLocaleString());
			jda.app.solrNumFound = count;
			var heatmapLayer = this.map.getLayersByName("HeatmapCellsLayer")[0];
			var heatmapDocuments = this.map.getLayersByName("HeatmapDocumentsLayer")[0];			
			if (solrResponse.response.numFound == 0) 
			{
			    heatmapDocuments.setVisibility(false);
			    heatmapLayer.setVisibility(false);
			    return;
			}
			facetHeatmap = this._solrResponseToObject(solrResponse);
			if (facetHeatmap.counts_ints2D == null)
			{
			    heatmapDocuments.setVisibility(false);
			    heatmapLayer.setVisibility(false);
			    return;
			}
			this.classifications = this.getClassifications(facetHeatmap);
			if (count > 100)
			    this.renderHeatmap(facetHeatmap, this.classifications);
			else
			{
			    this.renderDocuments(solrResponse);
			}
		    },
		    
		    renderHeatmap : function(facetHeatmap, classifications)
		    {
			var _this = this;
			this.initializeLayers();
			jda.app.facetHeatmap = facetHeatmap; // needed to display counts on mouse move
			var maxValue = classifications[classifications.length - 1]; 
			var heatmapLayer = this.map.getLayersByName("HeatmapCellsLayer")[0];
			var heatmapDocuments = this.map.getLayersByName("HeatmapDocumentsLayer")[0];
			heatmapDocuments.setVisibility(false);
			heatmapLayer.setVisibility(true);
			heatmapLayer.points = [];
			heatmapLayer.cache = {};
			heatmapLayer.defaultIntensity = 0;
			heatmapLayer.defaultRadius = 0;
			var colorGradient = this.getColorGradient(this.getColors(), classifications);
			heatmapLayer.setGradientStops(colorGradient);
			heatmapLayer.setOpacity(0.40);

			var extent = this.map.getExtent();
			var mapLowerLeft = new OpenLayers.LonLat(extent.left, extent.bottom);
                        var mapUpperRight = new OpenLayers.LonLat(extent.right, extent.top);
                        var geodeticProjection = new OpenLayers.Projection("EPSG:4326");
                        var mapLowerLeftGeodetic = mapLowerLeft.transform(this.map.getProjectionObject(), geodeticProjection);
			var mapUpperRightGeodetic = mapUpperRight.transform(this.map.getProjectionObject(), geodeticProjection);

			// cells size is also used on mouse click to define item capture distance
			jda.app.heatmapCellSize = Math.ceil(this.getCellSize(facetHeatmap, this.map));
			jda.app.solrUrl = this.solrHeatmapUrl;  // also pass along url from parameters.ini
			var latitudeStepSize = (facetHeatmap.maxY - facetHeatmap.minY) / facetHeatmap.rows;
			var longitudeStepSize = (facetHeatmap.maxX - facetHeatmap.minX) / facetHeatmap.columns;
			var countsArray = facetHeatmap.counts_ints2D;
			var heatmapSourceCount = 0;
			var pointNotOnMapCount = 0;
			//testData = this.generateTestData(facetHeatmap.rows, facetHeatmap.columns, classifications);
			// iterate over cell values and create heatmap items
			jQuery.each(countsArray, function(rowNumber, currentRow){
			//jQuery.each(testData, function(rowNumber, currentRow){
			    if (currentRow == null) return;
			    jQuery.each(currentRow, function(columnNumber, value){
				if (value == null || value <= 0) return;

				var latitude = facetHeatmap.minY + ((facetHeatmap.rows - rowNumber- 1) * latitudeStepSize) + (latitudeStepSize * .5); 
				var longitude = facetHeatmap.minX + (columnNumber * longitudeStepSize) + (longitudeStepSize * .5);
				var geodetic = new OpenLayers.LonLat(longitude, latitude); 
				if (geodetic.lat > mapUpperRightGeodetic.lat || geodetic.lat < mapLowerLeftGeodetic.lat
				    || geodetic.lon > mapUpperRightGeodetic.lon || geodetic.lon < mapLowerLeftGeodetic.lon)
				{pointNotOnMapCount++ ; return};  // point not on map
				var transformed = geodetic.transform(geodeticProjection, _this.map.getProjectionObject());
				var tmpValue = Math.min(classifications[classifications.length-1] / maxValue, value / maxValue);
				heatmapLayer.addSource(new Heatmap.Source(transformed, jda.app.heatmapCellSize, tmpValue));
				heatmapSourceCount++;
			    })
			});
			heatmapLayer.redraw();
			console.log("heatmapSourceCount", heatmapSourceCount, "pointNotOnMapCount", pointNotOnMapCount, "number of cells", facetHeatmap.rows*facetHeatmap.columns, "jda.app.heatmapCellSize", jda.app.heatmapCellSize, "classifications", classifications);
			$('.jda-map-loader').fadeOut('fast');
		    },
		    
		    // returns the count of how many values are in each classifications
		    // it is useful for test purposes
		    getClassificationCounts : function()
		    {
			var counts = [];
			var classifications = this.classifications;
			jQuery.each(classifications, function(index, value){
			    counts[index] = 0;
			});
			var array = facetHeatmap.counts_ints2D;
			jQuery.each(array, function(rowNumber, currentRow){
			    if (currentRow == null) return;
			    jQuery.each(currentRow, function(columnNumber, value){
				for (i = 0 ; i < classifications.length ; i++)
				{
				    if (value <= classifications[i])
				    {
					counts[i]++;
					return;
				    }
				}
			    })});
		        return counts;
		    },

		    // create vertial bars of colors on screen
		    // typically called after regular Solr request has completed
		    generateTestData : function(numberOfRows, numberOfColumns, classifications)
		    {
			var returnArray = [];
			var numberOfBars = classifications.length;
			var barSize = Math.floor(numberOfColumns / numberOfBars);
			for (var i = 0 ; i < numberOfRows ; i++)
			{
			    returnArray[i] = [];
			    for (var j = 0 ; j < numberOfColumns ; j++)
			    {
				index = Math.floor(j / barSize);
				returnArray[i][j] = classifications[index];
			    }
			}
			return returnArray;
		    },
		    

		    getClassifications : function(facetHeatmap)
		    {
			flatArray = [];
			var count = 0;
			var maxValue = 0;
			for (var i = 0; i < facetHeatmap.counts_ints2D.length; i++) 
			{
			    if (facetHeatmap.counts_ints2D[i] != null)  // entire row can be null
				for (var j = 0 ; j < facetHeatmap.counts_ints2D[i].length ; j++)
			        {
				    var currentValue = facetHeatmap.counts_ints2D[i][j];
				    if (currentValue != null) // && facetHeatmap.counts_ints2D[i][j] != 0)
			            {
					flatArray = flatArray.concat(currentValue);
					if (currentValue > maxValue) maxValue = currentValue;
					count++;
					
			            }
				}
			};
			// jenks classification takes too long on lots of data
			// so we just sample larger data sets
			reducedArray = [];
			var period = Math.ceil(count / 300);
			console.log("desired period", period);
			period = Math.min(period, 6);
			if (period > 1)
			{
			    for (i = 0 ; i < flatArray.length ; i = i + period)
				reducedArray.push(flatArray[i]);
			    reducedArray.push(maxValue);  // make sure largest value gets in, doesn't matter much if duplicated
			}
			else
			    reducedArray = flatArray;
			series = new geostats(reducedArray);
			numberOfClassifications = this.getColors().length - 1;
			classifications = series.getClassJenks(numberOfClassifications);

			var lastExtraZero = -1;
			for (var i = classifications.length - 1 ; i > 0 ; i--)
			    if (classifications[i] == 0 && lastExtraZero == -1)
				lastExtraZero = i;
			if (lastExtraZero > 0)
			    classifications = classifications.slice(lastExtraZero)
			return classifications;
		    },

		    // return heatmap cell size in pixels
		    getCellSize: function(facetHeatmap, map)
		    {
			var mapSize = map.getSize();
			var widthInPixels = mapSize.w;
			var heightInPixels = mapSize.h;
			var heatmapRows = facetHeatmap.rows;
			var heatmapColumns = facetHeatmap.columns;
			var sizeX = widthInPixels / heatmapColumns;
			var sizeY = heightInPixels / heatmapRows;
			var size = Math.max(sizeX, sizeY);
			return size; 
		    },

		    getColors: function()
		    {
                        //var colors = [0x000000, 0xffffb2ff, 0xfed976ff, 0xfeb24cff, 0xfd8d3cff, 0xf03b20ff, 0xbd0026ff];   // brewer
                        //var colors = [0x00000000, 0xd3d3d3ff, 0x0000dfff, 0x00effeff, 0x00ff42ff, 0xfeec30ff, 0xff5f00ff, 0xff0000ff]; 
                        var colors = [0x00000000, 0x0000dfff, 0x00effeff, 0x00ff42ff, 0xfeec30ff, 0xff5f00ff, 0xff0000ff]; 
			return colors;
		    },

		    // OpenLayers gradient is hash of values and colors
		    getColorGradient: function(colors, classifications)
		    {
			colorGradient = {};
			maxValue = classifications[classifications.length - 1];
			if (classifications.length != colors.length)
			    console.log("!!! number of classifications do not match colors", classifications.length, colors.length);
			for (var i = 0 ; i < classifications.length ; i++)
			{
			    value = classifications[i];
			    scaledValue = value / maxValue;
			    scaledValue = Number(scaledValue.toFixed(4));
			    if (scaledValue < 0)
				scaledValue = 0;
			    colorGradient[scaledValue] = colors[i];
			}
			return colorGradient;
		    },


		    _solrResponseToObject : function(data)
		    {
			// Solr object is array of name/value pairs, convert to hash
			heatmap = {};
			heatmapArray = data.facet_counts.facet_heatmaps['bbox_rpt'];
			jQuery.each(heatmapArray, function(index, value) {
			    if ((index % 2) == 0) {
				heatmap[heatmapArray[index]] = heatmapArray[index + 1];
			    }});
			return heatmap;
		    },

		    _mapViewToEnvelope: function(map) {
			extent = map.getExtent();
			lowerLeft = new OpenLayers.LonLat(extent.left, extent.bottom);
			upperRight = new OpenLayers.LonLat(extent.right, extent.top);
			geodeticProjection = new OpenLayers.Projection("EPSG:4326");
			lowerLeftGeodetic = lowerLeft.transform(map.getProjectionObject(), geodeticProjection);
			upperRightGeodetic = upperRight.transform(map.getProjectionObject(), geodeticProjection);
			if (upperRightGeodetic.lon > 180) upperRightGeodetic.lon = 180;
			if (lowerLeftGeodetic.lon < -180) lowerLeftGeodetic.lon = -180;
			envelope = ':"Intersects(ENVELOPE(' + lowerLeftGeodetic.lon + ', ' + upperRightGeodetic.lon + ', ' + upperRightGeodetic.lat + ', ' + lowerLeftGeodetic.lat + '))"';
			return envelope;
		    },

		    _mapViewToWkt: function(map) {
			extent = map.getExtent();
			lowerLeft = new OpenLayers.LonLat(extent.left, extent.bottom);
			upperRight = new OpenLayers.LonLat(extent.right, extent.top);

			geodeticProjection = new OpenLayers.Projection("EPSG:4326");
			lowerLeftGeodetic = lowerLeft.transform(map.getProjectionObject(), geodeticProjection);
			upperRightGeodetic = upperRight.transform(map.getProjectionObject(), geodeticProjection);
			if (upperRightGeodetic.lon > 180) upperRightGeodetic.lon = 180;
			if (lowerLeftGeodetic.lon < -180) lowerLeftGeodetic.lon = -180;
			wkt = '["' + lowerLeftGeodetic.lon + ' ' + lowerLeftGeodetic.lat + '" TO "' + upperRightGeodetic.lon + ' ' + upperRightGeodetic.lat + '"]';
			return wkt;
		    },


		    showHeatmapTest : function(data)
		    {
			heatmapLayer = new Heatmap.Layer("Heatmap");

			geodetic = new OpenLayers.LonLat(139.5, 35.5);  // Tokyo test point
			geodeticProjection = new OpenLayers.Projection("EPSG:4326");
			transformed = geodetic.transform(geodeticProjection, this.map.getProjectionObject());
                        heatmapLayer.addSource(new Heatmap.Source(transformed, 200, .9));
			heatmapLayer.setOpacity(0.50);
			this.map.addLayer(heatmapLayer);
			return heatmapLayer;
		    },

		initMap : function(){
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

/*					var dataLayer =  new OpenLayers.Layer.WMS(
						"cite:item - Tiled",
						_this.geoUrl + "?LAYERS=point&",
							{

								'SQL' : function(){ return this.resultsView.getSQLSearchString(); },
								BBOX: '',
								WIDTH : 250,
								HEIGHT : 250,
								RADIUS : 2,
								R : 225,
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

*/
					var proj = new OpenLayers.Projection("EPSG:4326");

					_this.map.setCenter(new OpenLayers.LonLat(140.652466, 38.052417).transform(proj, _this.map.getProjectionObject()), 9);
					_this.startMapListeners( _this.map );

					_this.initLayerControl();
					_this.mapLoaded = true;
					$(".olControlPanZoomBar").css({"top":"65px"});

					_this.map.addLayers(_this.getMapLayers());

          // merge in new params before adding the layer
          // dataLayer.mergeNewParams({'SQL' : jda.app.resultsView.getSQLSearchString()});   //spmcd
				//	_this.map.addLayer(dataLayer);   //spmcd
				    themap = _this.map;
					_this.map.addControl(new OpenLayers.Control.Attribution());
					_this.map.baseLayer.events.register('loadstart','ok',function(){$('.jda-map-loader').show();});
				        _this.map.baseLayer.events.register('loadend','ok',function(){$('.jda-map-loader').fadeOut('fast');});
					//_this.map.getLayersByName('cite:item - Tiled')[0].events.register('loadstart','ok',function(){$('.jda-map-loader').show();});
				        //_this.map.getLayersByName('cite:item - Tiled')[0].events.register('loadend','ok',function(){$('.jda-map-loader').fadeOut('fast');});
					_this.initTimeSlider(_this.map);
				    _this.sendSolrRequest();
				}
			);
		},

		startMapListeners : function(map){
			var _this = this;
		    this.map.events.register("moveend", map, function(){
			_this.sendSolrRequest();
		    });
		    this.map.events.register("movezoom", map, function(){
			_this.sendSolrRequest();
		    });

		    this.map.events.register('mousemove', map, function(e){
			// on mousemove, display number of items under mouse
			var eventLonLat =map.getLonLatFromViewPortPx(e.xy).transform(_this.map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));
			// from lonlat we have to compute offsets into heatmap array
			var facetHeatmap = jda.app.facetHeatmap;
			if (facetHeatmap == null) return;
			var heatmapLatitudeStepSize = (facetHeatmap.maxY - facetHeatmap.minY) / facetHeatmap.rows;
			var heatmapLongitudeStepSize = (facetHeatmap.maxX - facetHeatmap.minX) / facetHeatmap.columns;
			var heatmapIndexLatitude = Math.floor((eventLonLat.lat - facetHeatmap.minY) / heatmapLatitudeStepSize);
			var heatmapIndexLongitude = Math.floor((eventLonLat.lon - facetHeatmap.minX) / heatmapLongitudeStepSize);
			var counts = 0;
			try 
			{
			    counts = facetHeatmap.counts_ints2D[facetHeatmap.rows - heatmapIndexLatitude - 1][heatmapIndexLongitude];
			    if (isNaN(counts)) counts = 0;
			}
			catch (e) {counts = 0;} // errors due to nulls in solr array instead of zeros
			if (typeof(mapInit) === 'undefined')
			{
			    jQuery("#event-map").attr("title", "");
			    jQuery("#map").tooltip({track: true}); 
			    mapInit = true;
			}
			if (counts === 0 || (jda.app.solrNumFound <= 100))
			{
			    jQuery("#event-map").attr("title", "0");
			}
			else
			{
			    var tmp = new Number(counts);
			    jQuery("#event-map").attr("title", tmp.toLocaleString());
			}
			
		    });
			this.map.events.register('click', map, function(e){
				var event=e;
				var lonlat =map.getLonLatFromViewPortPx(e.xy).transform(_this.map.getProjectionObject(),new OpenLayers.Projection("EPSG:4326"));
				//if (lonlat.lat != null && lonlat.lat != null)
			    mapSelections =  new Browser.Items.MapCollection([],{SQL:jda.app.resultsView.getSQLSearchString(lonlat.lon,lonlat.lat), 
										 mouseLongitude: lonlat.lon, mouseLatitude: lonlat.lat});
				
				$('.olPopup').remove();
			    mapSelections.fetch(
				{error: function(arg, arg2, arg3, arg4){console.log("error!!!");baz = arg;baz2=arg2;baz3=arg3;baz4=arg4;}, 
				 success:function(response,collection){
				     // pop-up a jQuery window listing nearby items
				     _this.mapViewCollection = new Browser.Items.Collections.Views.MapPopup({ collection : mapSelections});
				     
				     console.log ('collection', collection);
				     console.log ('mapSelections', mapSelections);
				     if (typeof jda.app.oldMapPopup != 'undefined')
				     {
					 jda.app.oldMapPopup.dialog('close');
					 jda.app.oldMapPopup.dialog().remove();
				     }
				     if (collection.length === 0) return;
				     var popup = jQuery('<div></div>').dialog();
				     popup.html(_this.mapViewCollection.el.innerHTML);
				     var mapHeight = _this.map.size.h;
				     popup.dialog('option', 'height', Math.round(mapHeight * .75));
				     popup.dialog('option', 'width', '310px');
				     popup.dialog('option', 'title', 'Nearby Items');
				     popup.click(function(){popup.dialog('close')});
				     popup.parent().css({top: 200, left: 300});
				     popup.css({padding: '0em 0em'});
				     jda.app.oldMapPopup = popup;
				     popup.dialog('open');
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
			var dateMillis = $("#start-date").datepicker('getDate').getTime();
			var timeStrings = $("#start-time").val().split(':');
			var h = timeStrings[0];
			var m = timeStrings[1].split(' ')[0];
			var timeMillis = h*60*60*1000 + m*60*1000;
			var seconds = (dateMillis + timeMillis)/1000;
			var oldValues =  $("#range-slider").slider( "option", "values" );
			$( "#range-slider" ).slider( "option", "values", [seconds, oldValues[1]] );
			this.setStartDateTimeSliderBubble(seconds);
	},

		setEndDateTimeSliderHandle : function(){
			var dateMillis = $("#end-date").datepicker('getDate').getTime();
			var timeStrings = $("#end-time").val().split(':');
			var h = timeStrings[0];
			var m = timeStrings[1].split(' ')[0];
			var timeMillis = h*60*60*1000 + m*60*1000;
			var seconds = (dateMillis + timeMillis)/1000;
			var oldValues =  $("#range-slider").slider( "option", "values" );
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
		},

		    getDatesIso : function ()
		    {
			var dates = jQuery("#range-slider").slider( "option", "values" )
			// [1294112504, 1444324260.853]
			var date1 = new Date(dates[0] * 1000);
			var date2 = new Date(dates[1] * 1000);
			return [date1.toISOString(), date2.toISOString()];
		    },

		    // render each Solr document as a red dot
		    // this is more useful than the heatmap when there aren't many documents
		    renderDocuments: function(solrResponse)
		    {
			jda.app.heatmapCellSize = 5;
			var docs = solrResponse.response.docs;
			console.log('number of docs = ', docs.length);
			var geodeticProjection = new OpenLayers.Projection("EPSG:4326");
			var features = Array(docs.length);
			for (var i = 0 ; i < docs.length ; i++)
			{
			    try
			    {
				//based on http://dev.openlayers.org/examples/graphic-name.js
				var doc = docs[i];
				var rpt = doc.bbox_rpt;
				if (rpt.startsWith("POINT"))
				{
				    rpt = rpt.substr(6);
				    rpt = rpt.replace(')', '');
				    var parts = rpt.split(' ');
				    var lon = parts[0];
				    var lat = parts[1];
				    var geodetic = new OpenLayers.LonLat(Number(lon), Number(lat));
				    var transformed = geodetic.transform(geodeticProjection, this.map.getProjectionObject());
				    var geometry = new OpenLayers.Geometry.Point(transformed.lon, transformed.lat);
				    features[i] = new OpenLayers.Feature.Vector(geometry, {type: 'circle'});
				}
			    }
			    catch (exception)
			    {
				console.log("in jda.view.event-map:renderDocuments", exception);
			    }
			}
			var heatmapLayer = this.map.getLayersByName("HeatmapCellsLayer")[0];
			var heatmapDocuments = this.map.getLayersByName("HeatmapDocumentsLayer")[0];
			heatmapLayer.setVisibility(false);
			heatmapDocuments.setVisibility(true);
			heatmapDocuments.removeAllFeatures();
			heatmapDocuments.addFeatures(features);
			//this.map.addLayer(layer);
			console.log("rendered solr response as items");
		    }

	});


	})(jda.module("browser"));

function subsetArray(array, start, step)
{
    var newArray = [];
    for (var i = start ; i < array.length ; i = i + step)
	newArray.push(array[i]);
    return newArray;
}

function jenksOptions(array, maxValue)
{
    var series = new geostats(array);
    var jenks = series.getClassJenks(8);
    console.log("all data", array.length, jenks);
    for (var i = 2 ; i < 5 ; i++)
    {
	for (var j = 0 ; j < i ; j++)
	{
	    var r0 = subsetArray(array, j, i);
	    r0.push(maxValue);
	    var s0 = new geostats(r0);
	    var j0 = s0.getClassJenks(8);
	    console.log("step", i, "offset", j, j0);
	}
    }
}