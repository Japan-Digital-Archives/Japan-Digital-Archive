(function(Browser) {

	Browser.Users = Browser.Users || {};
	Browser.Users.Views = Browser.Users || {};
	
	
	
	Browser.Users.Views.UserPage = Backbone.View.extend({
		
		el : $('#jda-user-filter'),
		
		

		events: {
			
			//'click button.edit' : 'editMetadata',
		},
		initialize: function () {

			//for looking up address from lat/lon
			this.geocoder = new google.maps.Geocoder();


			var facetExists = false;
			

			/* Adjust layout for filter */
			//$('.tab-content').addClass('jda-low-top');
			$('#zeega-right-column').addClass('zeega-right-column-user-page');
			

			
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
				latitude : 38.266667,//this.model.get('media_geo_latitude'),
				longitude : 140.866667,
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
						console.log(results)
						$(_this.el).find('.jda-collection-map-location').html( results[ results.length-3 ].formatted_address );
					}
				}
			});

			/***************************************************************************
				Edit button
			***************************************************************************/
			if (this.model.get('editable')){
				$(this.el).find('button.edit').show().css('display','block');
				$(this.el).find('.edit').click(function()
					{
						_this.editMetadata();
					});
			}

			return this;
		},
		editMetadata : function()
		{
			console.log('edit the metadata!')
			var _this  = this;
			
			
			$(this.el).find('.save-data button').show();
			$(this.el).find('button.edit').addClass('active');
			/*
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
			});*/
		},
		remove:function(){

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
			
			'<div class="pull-left" style="width: 172px;">'+
				'<img class="pull-left" src="<%=thumbnail_url%>" alt="" style="width:160px;height:160px;margin-right:10px;border: 1px solid grey;">'+
				'<a href="#" class="jda-user-filter-edit-profile-image"><i class="icon-cog icon-white" style="left: 142px;top: 5px;position: absolute;"></i></a>'+
			'</div>'+
			'<div style="width:-webkit-calc(95%-400px);margin-right:10px;">'+
				'<h1 class="jda-user-filter-name"><%=display_name%></h1>'+
				
				'<div style="width:60%;float:left;margin-right:30px">'+
					'<p style="font-weight:bold">Joined on March 20th, 2012</p>'+
					'<span class="jda-user-filter-description"><%=bio%></span><i class="icon-plus-sign" style="display:none"></i>'+
					'<button class="btn btn-info btn-mini edit" style="display:none"><i class="icon-pencil icon-white"></i></button>'+
					'<div class="btn-group save-data">'+
						'<button class="btn btn-success btn-mini save hide">save</button>'+
						'<button class="btn btn-mini cancel hide">cancel</button>'+
					'</div>'+
				'</div>'+
				'<div>'+
					'<div class="jda-user-map" style="border:1px solid #aaa"></div>'+
					'<div class="jda-user-map-location"></div>'+
				'</div>'+
			'</div>';

			
			return html;
		},
		

	});

})(jda.module("browser"));