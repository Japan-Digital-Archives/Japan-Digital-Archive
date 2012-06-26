(function(Browser) {

	Browser.Users = Browser.Users || {};
	Browser.Users.Views = Browser.Users || {};
	
	
	
	Browser.Users.Views.UserPage = Backbone.View.extend({
		
		el : $('#jda-user-filter'),
		
		

		events: {
			
			'click button.edit' : 'editMetadata',
			'click button.save' : 'saveMetadata',
			'click button.cancel' : 'cancelEdits',
		},
		initialize: function () {

			//for looking up address from lat/lon
			this.geocoder = new google.maps.Geocoder();


			var facetExists = false;
			

			/* Adjust layout for filter */
			//$('.tab-content').addClass('jda-low-top');
			//$('#zeega-right-column').addClass('zeega-right-column-user-page');
			

			
			//first remove other user filters
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				if (facet.model.get("category")=="user" && facet.model.get("value") != _this.model.get('display_name')) {
					facet.model.set({'value': null });
					facet.remove();
				} else if (facet.model.get("category")=="user" && facet.model.get("value") == _this.model.get('display_name')){
					facetExists = true;
				}
			});
			
			//add user filter to the VisualSearch box
			if (!facetExists){	
				VisualSearch.searchBox.addFacet('user', this.model.get('display_name'), 0);
			}
			
			//user filter close removes the filter from the DOM and sets the object to null
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				
				if (facet.model.get("category")=="user") {
					$(facet.el).find('.VS-icon-cancel').click(function(){
						jda.app.removeFilter('user');

					});
				}
			});


		},
		render: function(done)
		{
			var _this = this;

			

			/***************************************************************************
				Put template together
			***************************************************************************/
			var template = this.getTemplate();
			var blanks = this.model.attributes;

			if (blanks["created_at"] == null){
				blanks["created_at"] = "March 20th, 2011";
			}
			$(this.el).html( _.template( template, blanks ) );

			$(this.el).find('.jda-user-filter-edit-profile-image').click(function(){
				alert('Edits profile image for user');
				return false;
			});

			/***************************************************************************
				Map
			***************************************************************************/
			this.cloudmadeUrl = 'http://{s}.tiles.mapbox.com/v2/mapbox.mapbox-streets/{z}/{x}/{y}.png',
	    	this.cloudmadeAttrib = '',
	   		this.cloudmade = new L.TileLayer(this.cloudmadeUrl, {maxZoom: 18, attribution: this.cloudmadeAttrib});
		
			
			var values = {
				latitude : this.model.get('location_latitude') == null ? 38.266667 : this.model.get('location_latitude'),//this.model.get('media_geo_latitude'),
				longitude : this.model.get('location_longitude') == null ? 140.866667 : this.model.get('location_longitude'),
			};
			this.latlng = new L.LatLng( values.latitude,values.longitude);
			var div = $(this.el).find('.jda-user-map').get(0);
			this.map = new L.Map(div);
			this.map.setView(this.latlng, 8).addLayer(this.cloudmade);
			this.marker = new L.Marker(this.latlng,{draggable:true});
			this.marker.addEventListener( 'drag', this.updateLatLng, this );
			this.marker.addEventListener( 'dragend', this.updateLocation, this );
			this.map.addLayer(this.marker);
		
			this.geocoder.geocode( { 'latLng' : new google.maps.LatLng(values.latitude,values.longitude) }, function(results, status) {	
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0].formatted_address)
					{
						$(_this.el).find('.jda-collection-map-location').html( results[ results.length-3 ].formatted_address );
					}
				}
			});

			/***************************************************************************
				Edit button
			***************************************************************************/
			if (this.model.get('editable')){
				$(this.el).find('button.edit').show();
				
			}

			return this;
		},
		saveMetadata : function()
		{
			this.turnOffEditMode();
			this.saveFields();
		},
		
		saveFields : function()
		{
			
			this.model.save({
				
				'bio' : $(this.el).find('.jda-user-filter-description').text(),
				'thumbnail_url' : $(this.el).find('.jda-user-filter-profile-image').attr('src'),
				
			})
		},
		
		cancelEdits : function()
		{
			this.turnOffEditMode();
		},
		
		turnOffEditMode : function()
		{
			$(this.el).find('.jda-user-edit-profile-image').hide();
			$(this.el).find('button.edit').removeClass('active');
			$(this.el).find('.editing').removeClass('editing').attr('contenteditable', false);
			$(this.el).find('.jda-user-map-location').removeClass('editing').attr('contenteditable', false);
			$(this.el).find('.save-data button').hide();
		},
		editMetadata : function()
		{
			console.log('edit the metadata!')
			var _this  = this;
			
			$(this.el).find('.jda-user-edit-profile-image').show();
			$(this.el).find('.save-data button').show();
			$(this.el).find('button.edit').addClass('active');
			$(this.el).find('.jda-user-filter-description').addClass('editing').attr('contenteditable', true);
			
			
			$(this.el).find('.jda-user-map-location').addClass('editing').attr('contenteditable', true).keypress(function(e){
				if(e.which==13)
				{
					_this.geocodeString();
					return false;
				}
			});

			$(this.el).find('.jda-user-edit-profile-image').droppable({
			    accept : '.list-fancymedia',
			    
			    tolerance : 'pointer',
			    over: function(event, ui) { 
			    	var newCover = jda.app.draggedItem.get('thumbnail_url');
			      	$(_this.el).find('.jda-user-filter-profile-image').attr('src', newCover).show();
				 	$(_this.el).find('.jda-user-edit-profile-image').hide();
			    },
			    out: function(){

			      	$(_this.el).find('.jda-user-filter-profile-image').hide();
				 	$(_this.el).find('.jda-user-edit-profile-image').show();
			    },
			    drop : function( event, ui )
			    {
			    	
			      	var newCover = jda.app.draggedItem.get('thumbnail_url');
			      	$(_this.el).find('.jda-user-filter-profile-image').attr('src', newCover).show();
				 	$(_this.el).find('.jda-user-edit-profile-image').hide();

			      
			      ui.draggable.draggable('option','revert',false);

			    }
			});
		},
		geocodeString : function()
		{
			var _this = this;
			var placeText = $(this.el).find('.jda-user-map-location').text();
			this.geocoder.geocode( { 'address': placeText}, function(results, status) {
			
				if (status == google.maps.GeocoderStatus.OK)
				{
					_this.latlng=new L.LatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
					
					_this.map.setView( _this.latlng,8);
					_this.marker.setLatLng(_this.latlng);
					
					_this.model.save({
						'location_latitude': results[0].geometry.location.lat(),
						'location_longitude': results[0].geometry.location.lng()
					})
				}
				else console.log("Geocoder failed at address look for "+$(that.el).find('.locator-search-input').val()+": " + status);
			});
		},
		remove:function(){

			console.log("Users.UserPage.remove");
			//remove from DOM
			$(this.el).empty();
			$('.jda-separate-collections-and-items').hide();
			$('.tab-content').removeClass('jda-low-top');
		
			$('.tab-content').css('top','auto');

			$('#zeega-right-column').removeClass('zeega-right-column-user-page');

		},
		
		getTemplate : function()
		{
			html = 
			
			'<div class="pull-left user-image-container">'+
				'<img class="pull-left jda-user-filter-profile-image" src="<%=thumbnail_url%>" alt="" style="width:160px;height:160px;margin-right:10px;border: 1px solid grey;">'+
				'<div class="jda-user-edit-profile-image" style="display:none;border: 1px solid #666;background: #CCC;width: 160px;position: absolute;opacity: 0.9;height: 160px;text-align:center">'+
					'<i class="jdicon-drag" style="float:none;position:relative;top:30px"></i> '+
					'<p style="font-weight: bolder;color: #333;text-align: center;padding: 30px;">Drag a new image here</p>'+
				'</div>'+
			'</div>'+
			'<div style="margin-right:10px;">'+
				'<h1 class="jda-user-filter-name"><%=display_name%></h1>'+
				
				'<div style="width:60%;float:left;margin-right:30px">'+
					'<p style="font-weight:bold">Joined on <%= created_at%></p>'+
					'<span class="jda-user-filter-description"><%=bio%></span><i class="icon-plus-sign" style="display:none"></i>'+
					'<p><button class="btn btn-info btn-mini edit" style="display:none"><i class="icon-pencil icon-white"></i></button></p>'+
					'<div class="btn-group save-data">'+
						'<button class="btn btn-success btn-mini save hide">save</button>'+
						'<button class="btn btn-mini cancel hide">cancel</button>'+
					'</div>'+
				'</div>'+
				'<div class="pull-right">'+
					'<div class="jda-user-map" style="border:1px solid #aaa"></div>'+
					'<div class="jda-user-map-location"></div>'+
				'</div>'+
			'</div>';

			
			return html;
		},
		

	});

})(jda.module("browser"));