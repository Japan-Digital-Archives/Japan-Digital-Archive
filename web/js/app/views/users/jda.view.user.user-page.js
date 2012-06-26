(function(Browser) {

	Browser.Users = Browser.Users || {};
	Browser.Users.Views = Browser.Users || {};
	
	Browser.Users.Views.UserPage = Backbone.View.extend({
		
		el : $('#jda-user-filter'),
		
		events: {
			
			'click a.edit' : 'editMetadata',
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
			
			console.log('user info', this.model)


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
				latitude : this.model.get('locationLatitude') == null ? 38.266667 : this.model.get('locationLatitude'),//this.model.get('media_geo_latitude'),
				longitude : this.model.get('locationLongitude') == null ? 140.866667 : this.model.get('locationLongitude'),
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
			$(this.el).find('.jda-user-filter-description').text($(this.el).find('.jda-user-filter-description').text().substring(0,250));
			this.model.save({
				
				'bio' : $(this.el).find('.jda-user-filter-description').text().substring(0,250),
				'thumbnail_url' : $(this.el).find('.jda-user-filter-profile-image').attr('src'),
				
			})
		},
		
		cancelEdits : function()
		{
			this.turnOffEditMode();
		},
		
		turnOffEditMode : function()
		{
			this.$el.find('.user-image-upload , .save-data button').hide();
			this.$el.find('.edit').show();

			$(this.el).find('button.edit').removeClass('active');
			$(this.el).find('.editing').removeClass('editing').attr('contenteditable', false);
			$(this.el).find('.jda-user-map-location').removeClass('editing').attr('contenteditable', false);
		},
		editMetadata : function()
		{
			console.log('edit the metadata!')
			var _this  = this;
			
			this.$el.find('.user-image-upload, .save-data button').show();
			this.$el.find('.edit').hide();
			
			$(this.el).find('button.edit').addClass('active');
			$(this.el).find('.jda-user-filter-description').addClass('editing').attr('contenteditable', true);
			
			
			$(this.el).find('.jda-user-map-location').addClass('editing').attr('contenteditable', true).keypress(function(e){
				if(e.which==13)
				{
					_this.geocodeString();
					return false;
				}
			});
			return false
		},
		
		fileUpload : function()
		{
			//starting setting some animation when the ajax starts and completes
			$("#loading")
				.ajaxStart(function(){
					$(this).show();
				})
				.ajaxComplete(function(){
					$(this).hide();
			});

/*
		prepareing ajax file upload
		url: the url of script file handling the uploaded files
		fileElementId: the file type of input element id and it will be the index of  $_FILES Array()
		dataType: it support json, xml
		secureuri:use secure protocol
		success: call back function when the ajax complete
		error: callback function when the ajax failed
*/
			$.ajaxFileUpload({
				url:'doajaxfileupload.php', 
				secureuri:false,
				fileElementId:'fileToUpload',
				dataType: 'json',
				success: function (data, status)
				{
					if(typeof(data.error) != 'undefined')
					{
						if(data.error != '')
						{
							console.log('error 2',data.error);
						}
						else
						{
							console.log('error 1',data.msg);
						}
					}
				},
				error: function (data, status, e)
				{
					console.log('error!!',e);
				}
			})

			return false;

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
		remove:function()
		{
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
			
			'<div class="row-fluid">'+
			
				'<div class="span2" style="width:155px">'+
					'<img class="pull-left jda-user-filter-profile-image" src="<%=thumbnail_url%>" alt="" style="width:160px;height:160px;margin-right:10px;border: 1px solid grey;">'+
				'</div>'+
				
				'<div class="span6">'+
					'<h1 class="jda-user-filter-name"><%=display_name%></h1>'+
					'<h5>Joined on <%= created_at %></h5>'+
					'<div class="jda-user-filter-description"><%=bio%></div>';

					//'<div class="user-image-upload"><input type="file" name="datafile" size="40"></div>'+
	if(this.model.get('editable')) html += '<a href="#" class="edit"><i class="icon-pencil"></i></a>'+
					
						//'<p><button class="btn btn-info btn-mini edit" style="display:none"><i class="icon-pencil icon-white"></i></button></p>'+
					'<div class="btn-group save-data">'+
						'<button class="btn btn-success btn-mini save hide">save</button>'+
						'<button class="btn btn-mini cancel hide">cancel</button>'+
					'</div>'+
				'</div>'+
				'<div class="span2">'+
					'<div class="jda-user-map" style="border:1px solid #aaa"></div>'+
					'<div class="jda-user-map-location"></div>'+
				'</div>'+
			'</div>';

			
			return html;
		},
		

	});

})(jda.module("browser"));