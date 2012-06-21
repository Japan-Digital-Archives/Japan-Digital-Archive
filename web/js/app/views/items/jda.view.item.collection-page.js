(function(Browser) {

	Browser.Items = Browser.Items || {};
	Browser.Items.Views = Browser.Items || {};
	
	Browser.Items.Views.CollectionPage = Backbone.View.extend({
		
		el : $('#jda-collection-filter'),

		events: {
			'click button.play' : function(){alert('Plays slideshow');},
			'click button.share' : function(){alert('Opens publish process modal window');},
			'click button.edit' : 'editMetadata',
			'click button.save' : 'saveMetadata',
			'click button.cancel' : 'cancelEdits',
			'click .jda-collection-filter-author' : 'goToAuthorPage'
		},
		
		initialize: function () {

			//for looking up address from lat/lon
			this.geocoder = new google.maps.Geocoder();

			this.isGeoLocated = !_.isNull( this.model.get('media_geo_latitude') );


			this.isEditView = false;
			this.isMoreView = false;
			this.elemId = Math.floor(Math.random()*10000);

			/* Adjust layout for filter */
			$('.tab-content').addClass('jda-low-top');
			$('#zeega-right-column').addClass('zeega-right-column-low');

			/* Adjust Visual Search box with proper filters */
	      var facetExists = false;

			//first remove other collection filters
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				if (facet.model.get("category")=="collection" && facet.model.get("value") != _this.model.get('title')) {
					facet.model.set({'value': null });
					facet.remove();
				} else if (facet.model.get("category")=="collection" && facet.model.get("value") == _this.model.get('title')){
					facetExists = true;
				}
			});
			
			//add collection filter to the VisualSearch box
			if (!facetExists){	
				VisualSearch.searchBox.addFacet('collection', this.model.get('title'), 0);
				_.delay(function(){	$('input').blur();},500);
			}
			
			//collection close removes the filter from the DOM and sets the object to null
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				
				if (facet.model.get("category")=="collection") {
					$(facet.el).find('.VS-icon-cancel').click(function(){
						jda.app.removeFilter('collection');

					});
					
					
				}
				
		
			});
			
			console.log('collection view', this)


	  },
	
	goToAuthorPage : function()
	{
		var _this = this;
		_.each( VisualSearch.searchBox.facetViews, function( facet ){
		
			if (facet.model.get("category")=="collection" && facet.model.get("value") == _this.model.get('title')) {
				facet.model.set({'value': null });
				facet.remove();
			}
		});

		//retrieve user object and then add user filter
		var Browser = jda.module("browser");
		
		var userID = _this.model.get('user_id');
		var authorModel = new Browser.Users.Model({id:userID});
		authorModel.fetch({
			success : function(model, response){
				jda.app.addFilter(model,'user', {collection:''});
			},
			error : function(model, response){
				console.log('Failed to fetch the user object.');
				console.log(model);
			},

		});
		
	},
	
	  render: function(done)
	  {
	  	var _this = this;
	  	var canEdit = true;//this.model.get('can_edit');
	  	
	  	if (this.isEditView){
	  		this.isMoreView=true;
	  	}
	  	
			/***************************************************************************
				Put template together
			***************************************************************************/
			var template = this.getTemplate();
			var blanks = this.model.attributes;
			blanks.randId = this.elemId
		
			$(this.el).html( _.template( template, blanks ) );

			/***************************************************************************
				show in archive
			***************************************************************************/
			if (this.model.get('show_in_archive')){
				$(this.el).find('.show_in_archive_true').show();
				$(this.el).find('.show_in_archive_false').hide();
			}else{
				$(this.el).find('.show_in_archive_false').show();
				$(this.el).find('.show_in_archive_true').hide();
			}
			/***************************************************************************
				MORE vs LESS view
			***************************************************************************/
			//Don't show more/less option in edit view
			if (this.isMoreView){
				if (this.isEditView){
					$('#jda-less-about-this-collection').hide();
					$('#jda-more-about-this-collection').hide();
				} else{
					$('#jda-less-about-this-collection').show();
					$('#jda-more-about-this-collection').hide();
				}
				
				$('#zeega-left-column').addClass('zeega-left-column-really-low');
				$('#zeega-right-column').addClass('zeega-right-column-really-low');
			}else{
				$('#jda-more-about-this-collection').show();
				$('#jda-less-about-this-collection').hide();
				$('#zeega-left-column').removeClass('zeega-left-column-really-low');
				$('#zeega-right-column').removeClass('zeega-right-column-really-low');
			}
			

			$('#jda-less-about-this-collection').click(function(){
				
				_this.isMoreView = false;
				_this.render();

			});
			$('#jda-more-about-this-collection').click(function(){
				
				_this.isMoreView = true;
				_this.render();

			});

			if (this.isMoreView){
				/***************************************************************************
					Map view
				***************************************************************************/
				
				var Browser = jda.module('browser');
				var mapEditable = this.isEditView;
				this.locatorMapView = new Browser.Views.LocatorMap({ model : this.model, isEditable : mapEditable});

				$(this.el).find('.geo').append(this.locatorMapView.render());

				if (this.locatorMapView.geoLocated){this.locatorMapView.addMap();}

				/***************************************************************************
					Tags view
				***************************************************************************/
				$(this.el).find('.tagsedit').empty().tagsInput({
					'interactive':canEdit && this.isEditView,
					'defaultText':'add a tag',
					'onAddTag':function(){_this.updateTags('',_this)},
					'onRemoveTag':function(){_this.updateTags('',_this)},
					'removeWithBackspace' : false,
					'minChars' : 1,
					'maxChars' : 0,
					'placeholderColor' : '#C0C0C0',
				});
				
				$(this.el).find('.jda-more').show();

			}
			/***************************************************************************
				"more" button for long descriptions (doesn't work yet)
			***************************************************************************/
			/*if (this.model.get('description').length > 200){
				var newDesc = $(this.el).find('.jda-collection-filter-description').text().substring(0,200);
				$(this.el).find('.jda-collection-filter-description').text( newDesc + "...");
				$(this.el).find('.icon-plus-sign').show();
			}*/

			
			/***************************************************************************
				User name link going to User profile page
			***************************************************************************/
			/*
			$('.jda-collection-filter-author').click(function(){

				_.each( VisualSearch.searchBox.facetViews, function( facet ){
				
					if (facet.model.get("category")=="collection" && facet.model.get("value") == _this.model.get('title')) {
						facet.model.set({'value': null });
						facet.remove();
					}
				});

				//retrieve user object and then add user filter
				var Browser = jda.module("browser");
				
				var userID = _this.model.get('user_id');
				var authorModel = new Browser.Users.Model({id:userID});
				authorModel.fetch({
					success : function(model, response){
						jda.app.addFilter(model,'user', {collection:''});
					},
					error : function(model, response){
						console.log('Failed to fetch the user object.');
						console.log(model);
					},

				});
				
			});
*/

			
			/***************************************************************************
				Show in Archive setting - TODO - PUT IN MODAL
			***************************************************************************/
			
			/*if (this.model.get('show_in_archive') == true){
				$('input[name=show_in_archive]').attr('checked','true');

			}
			$(this.el).find('input[name=show_in_archive]').click(function(){
				var checked = $('input[name=show_in_archive]').attr('checked');
				
				_this.model.save({ 	show_in_archive:checked});
			});*/

			/***************************************************************************
				Edit title
			***************************************************************************/
			if (canEdit && this.isEditView){

				$(this.el).find('.jda-collection-filter-title').addClass('jda-editable');
				$(this.el).find('.jda-collection-filter-title').editable(
					function(value, settings)
					{ 
						var oldTitle = _this.model.get('title');
						_this.model.save({ 	title:value}, 
						{				
							success: function(model, response) { 
								console.log("Updated item title for item " + model.id);
							
								_.each( VisualSearch.searchBox.facetViews, function( facet ){
									if( facet.model.get('category') == 'collection' && facet.model.get('value') == oldTitle) {
										
										console.log(facet);
										facet.model.set({'value': model.get('title') });
										facet.render();
									}
									
								})

								//Reset the collections drawer because there's also a collection view there
								//jda.app.myCollectionsDrawer.getCollectionList();
							
			 				},
			 				error: function(model, response){
			 					
			 					console.log("Error updating item title.");
			 					console.log(response);
			 				}
			 			});
						return value; //must return the value
					},
					{
						indicator : 'Saving...',
						tooltip   : 'Click to edit...',
						indicator : '<img src="images/loading.gif">',
						select : false,
						onblur : 'submit',
						width : 250,
						
					});

			}
			/***************************************************************************
				Edit Description
			***************************************************************************/
			if (canEdit && this.isEditView){

				$(this.el).find('.jda-collection-filter-description').addClass('jda-editable');
				$(this.el).find('.jda-collection-filter-description').editable(
					function(value, settings)
					{ 
						_this.model.save({ 	description:value}, 
						{				
							success: function(model, response) { 
								console.log("Updated item description for item " + model.id);
			 				},
			 				error: function(model, response){
			 					console.log("Error updating description.");
			 					console.log(response);
			 				}
			 			});
						return value; //must return the value
					},
					{
						indicator : 'Saving...',
						tooltip   : 'Click to edit description...',
						indicator : '<img src="images/loading.gif">',
						select : false,
						onblur : 'submit',
						width : 300,
						
					});

			}
			/***************************************************************************
				Take away location when map is showing ?
			***************************************************************************/
			/*if (this.isMoreView){
				$(this.el).find('.jda-collection-filter-location').hide();
			}*/
			/***************************************************************************
				Look up location with reverse geocode
			***************************************************************************/
			if (!_.isUndefined(this.model.get('media_geo_latitude')) && !_.isUndefined(this.model.get('media_geo_longitude'))){
				this.geocoder.geocode( { 'latLng' : new google.maps.LatLng(this.model.get('media_geo_latitude'),this.model.get('media_geo_longitude')) }, function(results, status) {	
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0].formatted_address){
							$(_this.el).find('.jda-collection-filter-location').text( results[0].formatted_address );
							
						}
					}
				});
			}
			/***************************************************************************
				Set cover image
			***************************************************************************/
			//Replace broken thumbnail images with option to drag new item
			$(this.el).find('img').error(function() {
			   $(_this.el).find('img').hide();
			   if (canEdit){
				 $(_this.el).find('.jda-collection-filter-drag-item-here').show();
				}
			});
			//if thumbnail isn't set
			if (this.model.get('thumbnail_url') == null || this.model.get('thumbnail_url').length <=0){
				 $(_this.el).find('img').hide();
				 if (canEdit){
				 	$(_this.el).find('.jda-collection-filter-drag-item-here').show();
				}
			}
			if (!canEdit || !this.isEditView){
				$('#jda-collection-editing-toolbar').hide();
			}
			if (canEdit && this.isEditView){
				$('#jda-collection-editing-toolbar').fadeIn();

				$(this.el).find('img, .jda-collection-filter-drag-item-here').droppable({
				    accept : '.list-fancymedia',
				    
				    tolerance : 'pointer',
				    over: function(event, ui) { 
				    	var newCover = jda.app.draggedItem.get('thumbnail_url');
				      	$(_this.el).find('img').attr('src', newCover).show();
					 	$(_this.el).find('.jda-collection-filter-drag-item-here').hide();
				    },
				    out: function(){

				      	$(_this.el).find('img').hide();
					 	$(_this.el).find('.jda-collection-filter-drag-item-here').show();
				    },
				    drop : function( event, ui )
				    {
				    	
				      	var newCover = jda.app.draggedItem.get('thumbnail_url');
				      	$(_this.el).find('img').attr('src', newCover).show();
					 	$(_this.el).find('.jda-collection-filter-drag-item-here').hide();

				      	_this.model.save(
				      		{thumbnail_url:newCover},
					      	{}
				      );
				      
				      ui.draggable.draggable('option','revert',false);

				    }
				});
			}
			
			/***************************************************************************
				Show editing button and editing toolbar 
			***************************************************************************/
			if (canEdit){
				
				if(this.isEditView){
					$(this.el).find('.jda-done-btn').show();
					$(this.el).find('.jda-done-btn').click(function(){
						_this.isEditView = false;
						_this.render();
					});
				} else {
					$(this.el).find('.jda-edit-btn').show();
					$(this.el).find('.jda-edit-btn').click(function(){
						_this.isEditView = true;
						_this.render();
					});
				}
				
			}
			if (canEdit && this.isEditView){
				
				/*$('.tab-content').find('.jda-item-checkbox').show();
				$('.jda-item-checkbox').click(function(e){
					
					//prevent fancybox from loading
					e.stopPropagation();
				});*/
				$('#jda-collection-editing-toolbar-select-all').click(function(){
					if($('#jda-collection-editing-toolbar-select-all').attr('checked')){
						$('.tab-content').find('.jda-item-checkbox').attr('checked', true);
					} else {
						$('.tab-content').find('.jda-item-checkbox').attr('checked', false);
					}
				});
			}

			//Make sure layout is ok
			//$(this.el).width(jda.app.getLeftColumnWidth());
			$(this.el).width($('#zeega-main-content').width());


			/***********
			MAP
			***********/
			
			//this.geocoder = new google.maps.Geocoder();
			//this.mapRendered=false;
			//this.isEditable = !_.isUndefined(this.options.isEditable) ? this.options.isEditable : true;
			

			
			this.cloudmadeUrl = 'http://{s}.tiles.mapbox.com/v2/mapbox.mapbox-streets/{z}/{x}/{y}.png',
	    	this.cloudmadeAttrib = '',
	   		this.cloudmade = new L.TileLayer(this.cloudmadeUrl, {maxZoom: 18, attribution: this.cloudmadeAttrib});
		
		
			
			if( this.isGeoLocated )
			{
				var values = {
					latitude : this.model.get('media_geo_latitude'),
					longitude : this.model.get('media_geo_longitude'),
				};
				this.latlng = new L.LatLng( values.latitude,values.longitude);
				var div = $(this.el).find('.jda-collection-map').get(0);
				this.map = new L.Map(div);
				this.map.setView(this.latlng, 8).addLayer(this.cloudmade);
				this.marker = new L.Marker(this.latlng,{draggable:true});
				this.marker.addEventListener( 'drag', this.updateLatLng, this );
				this.marker.addEventListener( 'dragend', this.updateLocation, this );
				this.map.addLayer(this.marker);
			}
			
			
			$(this.el).find('.cover-image').droppable({
				drop : function(e,ui)
				{
					console.log('dropped', jda.app.draggedItem)
					var item = jda.app.draggedItem;
					var t = ( item.get('layer_type') == 'Image' ) ? item.get('uri') : item.get('thumbnail_url');
					_this.model.save({'thumbnail_url':t});
					$(_this.el).find('.cover-image').css('background-image','url('+t+')');
					$(_this.el).find('.drop-to').remove();
				}
			})

			jda.app.redrawLayout();

			return this;
		},
		
		editMetadata : function()
		{
			console.log('edit the metadata!')
			var _this  = this;
			this.loadMap();
			
			$(this.el).find('.save-data button').show();
			$(this.el).find('button.edit').addClass('active');
			$(this.el).find('.cover-overlay h1').addClass('editing').attr('contenteditable', true).keypress(function(e){
				if(e.which==13)
				{
					_this.saveFields();
					$(this).blur();
					return false;
				}
			});
			$(this.el).find('.jda-collection-description').addClass('editing').attr('contenteditable', true);
			$(this.el).find('.jda-collection-map-location').addClass('editing').attr('contenteditable', true).keypress(function(e){
				if(e.which==13)
				{
					_this.geocodeString();
					return false;
				}
			});
		},
		
		saveMetadata : function()
		{
			this.turnOffEditMode();
			this.saveFields();
		},
		
		saveFields : function()
		{
			this.model.save({
				'title' : $(this.el).find('.cover-overlay h1').text(),
				'description' : $(this.el).find('.jda-collection-description').text()
			})
		},
		
		cancelEdits : function()
		{
			this.turnOffEditMode();
		},
		
		turnOffEditMode : function()
		{
			$(this.el).find('.save-data button').hide();
			$(this.el).find('button.edit').removeClass('active');
			$(this.el).find('.editing').removeClass('editing').attr('contenteditable', false);
		},
		
		loadMap : function()
		{
			if( !this.isGeoLocated )
			{
				this.latlng = new L.LatLng( 38.266667,140.866667 );
				var div = $(this.el).find('.jda-collection-map').get(0);
				this.map = new L.Map(div);
				this.map.setView(this.latlng, 8).addLayer(this.cloudmade);
				this.marker = new L.Marker(this.latlng,{draggable:true});
				this.marker.addEventListener( 'drag', this.updateLatLng, this );
				this.marker.addEventListener( 'dragend', this.updateLocation, this );
				this.map.addLayer(this.marker);
			}
			
			
		},
		
		updateLatLng : function(e)
		{
			var latLng = e.target.getLatLng();
			$(this.el).find('.jda-collection-map-location').html( Math.floor(latLng.lat*1000)/1000 +','+ Math.floor(latLng.lng*1000)/1000)
		},
		
		updateLocation : function(e)
		{
			var _this = this;
			var latlng = e.target.getLatLng();
			console.log(this,latlng)
			this.model.save({
				'media_geo_latitude':latlng.lat,
				'media_geo_longitude':latlng.lng
			});
			
			this.geocoder.geocode( { 'latLng' : new google.maps.LatLng(latlng.lat,latlng.lng) }, function(results, status) {	
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0].formatted_address)
					{
						console.log(results)
						$(_this.el).find('.jda-collection-map-location').html( results[ results.length-3 ].formatted_address );
					}
				}
			});
		},
		
		geocodeString : function()
		{
			var _this = this;
			var placeText = $(this.el).find('.jda-collection-map-location').text();
			this.geocoder.geocode( { 'address': placeText}, function(results, status) {
			
				if (status == google.maps.GeocoderStatus.OK)
				{
					console.log(results)
					_this.latlng=new L.LatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
					
					_this.map.setView( _this.latlng,8);
					_this.marker.setLatLng(_this.latlng);
					console.log(results[0].geometry.location.lat(),results[0].geometry.location.lng())
					_this.model.save({
						'media_geo_latitude': results[0].geometry.location.lat(),
						'media_geo_longitude': results[0].geometry.location.lng()
					})
				}
				else console.log("Geocoder failed at address look for "+$(that.el).find('.locator-search-input').val()+": " + status);
			});
		},
		
		updateTags:function(name, _this)
		{
		    model = _this.model;
			var $t = $("#"+_this.elemId+"_tagsinput").children(".tag");
			var tags = [];
			for (var i = $t.length; i--;) 
			{  
				tags.push($($t[i]).text().substring(0, $($t[i]).text().length -  1).trim());  
			}
			_this.model.save({tags : tags});
		},	
		remove:function(){

			//remove from DOM
			$(this.el).empty();

			$('.jda-edit-btn').hide();
			$('.tab-content').find('.jda-item-checkbox').hide();
			$('.tab-content').removeClass('jda-low-top');
			$('.tab-content').css('top','auto');

			$('#zeega-right-column').removeClass('zeega-right-column-low');
			
		},
		
		getTemplate : function()
		{
			html = 
			
			'<div class="jda-collection-head">'+
				'<div class="cover-image" style="background-image:url(<%= thumbnail_url %>)">';
		if(_.isNull(this.model.get('thumbnail_url')) || this.model.get('thumbnail_url') == '' ) html += '<div class="drag-to"><i class="icon-camera"></i> drag cover image here</div>';
		html+=			'<div class="cover-overlay">'+
						'<h1><%=title%></h1><h4>by: <a href="#" class="jda-collection-filter-author"><%=media_creator_username%></a> on <%= date_created %></h4>'+
					'</div>'+
				'</div>'+

					'<div class="left-col">'+
						'<div class="btn-toolbar">'+
							'<div class="btn-group">'+
								'<button class="btn btn-info btn-mini play"><i class="icon-play icon-white"></i></button>'+
								'<button class="btn btn-info btn-mini share"><i class="icon-share-alt icon-white"></i></button>'+
								'<button class="btn btn-info btn-mini edit"><i class="icon-pencil icon-white"></i></button>'+
							'</div>'+
							'<div class="btn-group save-data">'+
								'<button class="btn btn-success btn-mini save hide">save</button>'+
								'<button class="btn btn-mini cancel hide">cancel</button>'+
							'</div>'+
						'</div>'+
						'<div class="jda-collection-description"><%= description %></div>'+
						'<div class="jda-collection-tags"><a href="#">add tags</a></div>'+
						
					'</div>'+
					'<div class="right-col">'+
						'<div class="jda-collection-map"></div>'+
						'<div class="jda-collection-map-location"></div>'+
					'</div>'+
					
			'</div>';
			
			return html;
		},
		

});

})(jda.module("browser"));