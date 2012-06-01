(function(Items) {

	//This is for the description/title info of a collection that shows up at the top of the page
	Items.Views.UserPage = Backbone.View.extend({
		
		el : $('#jda-user-filter'),
		
		

		events: {
			

		},
		initialize: function () {
	      


	  },
	  render: function(done)
	  {
	  	var _this = this;

	  	var facetExists = false;

			/*//first remove other user filters
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				if (facet.model.get("category")=="user" && facet.model.get("value") != _this.model.get('title')) {
					facet.model.set({'value': null });
					facet.remove();
				} else if (facet.model.get("category")=="collection" && facet.model.get("value") == _this.model.get('title')){
					facetExists = true;
				}
			});
			
			//add collection filter to the VisualSearch box
			if (!facetExists){	
				VisualSearch.searchBox.addFacet('collection', this.model.get('title'), 0);
			}
			
			//collection close removes the filter from the DOM and sets the object to null
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				
				if (facet.model.get("category")=="collection") {
					$(facet.el).find('.VS-icon-cancel').click(function(){
						jda.app.removeCollectionFilter();

					});
				}
			});
		*/
			/***************************************************************************
				Overall Layout adjustments for Collection page view
			***************************************************************************/
			$('.tab-content').addClass('jda-low-top');
			$('#zeega-right-column').hide();
			$('#zeega-left-column').removeClass('span10');
			$('#zeega-left-column').addClass('span12');
			

			/***************************************************************************
				Put template together
			***************************************************************************/
			var template = this.getTemplate();
			var blanks = this.model.attributes;
			
			$(this.el).html( _.template( template, blanks ) );
			
			/***************************************************************************
				"more" button for long descriptions (doesn't work yet)
			***************************************************************************/
			if (this.model.get('description').length > 255){
				$(this.el).find('.icon-plus-sign').show();
			}

			
			/***************************************************************************
				View all collections link
			***************************************************************************/
			$('.jda-view-all-collections').click(function(){

				_.each( VisualSearch.searchBox.facetViews, function( facet ){
				
					if (facet.model.get("category")=="collection" && facet.model.get("value") == _this.model.get('title')) {
						facet.model.set({'value': null });
						facet.remove();
					}
				});
				
				$('#zeega-content-type').val("collection");
    			$('#select-wrap-text').text( $('#zeega-content-type option[value=\''+$('#zeega-content-type').val()+'\']').text() );

				jda.app.removeCollectionFilter();

			});

			


			/***************************************************************************
				Edit Description
			***************************************************************************/
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
					width : 250,
					
				});

			
			/***************************************************************************
				Set cover image
			***************************************************************************/
			//Replace broken thumbnail images with option to drag new item
			$(this.el).find('img').error(function() {
			   $(_this.el).find('img').hide();
				 $(_this.el).find('.jda-collection-filter-drag-item-here').show();
			});
			//if thumbnail isn't set
			if (this.model.get('thumbnail_url') == null || this.model.get('thumbnail_url').length <=0){
				 $(_this.el).find('img').hide();
				 $(_this.el).find('.jda-collection-filter-drag-item-here').show();
			}
			
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

			
			/***************************************************************************
				Show editing toolbar - TODO - only show if user is owner
			***************************************************************************/
			

			$('#jda-collection-editing-toolbar').show();
			$('.jda-item-checkbox').show();
			$('.jda-item-checkbox').click(function(e){
				
				//prevent fancybox from loading
				e.stopPropagation();
			});
			$('#jda-collection-editing-toolbar-select-all').click(function(){
				if($('#jda-collection-editing-toolbar-select-all').attr('checked')){
					$('.jda-item-checkbox').attr('checked', true);
				} else {
					$('.jda-item-checkbox').attr('checked', false);
				}
			});

			return this;
		},
		remove:function(){

			//remove from DOM
			$(this.el).empty();

			$('#jda-collection-editing-toolbar').hide();
			$('.jda-item-checkbox').hide();
			
			//reset height of main results content & my collections
			$('.tab-content').removeClass('jda-low-top');
			$('#zeega-right-column').show();
			$('#zeega-left-column').addClass('span10');
			$('#zeega-left-column').removeClass('span12');
			

			
		},
		
		getTemplate : function()
		{
			html = 
			

			'<div class="span12">'+
				'<a href="#" class="jda-view-all-collections">< View All Collections</a>'+
			'</div>'+
			'<div class="span4">'+
			'<div class="pull-left zeega-collection rotated-left" style="margin-right:12px">'+
			'<p class="jda-collection-filter-drag-item-here" style="display:none;color: grey;position: relative;font-size: 12px;top: 41px;text-align:center">Drag item here <br>to set cover image</p>'+
			'<img src="<%=thumbnail_url%>" alt="" style="width:160px;height:120px;">'+
			'</div>'+
			'<h3 class="jda-collection-filter-title"><%=title%></h3>'+
			'<p><strong>by <span class="jda-collection-filter-author">Lindsey Wagner</span></strong></p>'+


			'</div>'+
			'<div class="span6">'+

			'<span class="jda-collection-filter-description"><%=description%></span><i class="icon-plus-sign" style="display:none"></i>'+
			'<p><strong>Tokyo, Japan</strong></p>'+


			'</div>'+
			'<div class="span2">'+

				'<button class="btn btn-info btn-mini" type="button" style="width:65px;margin-bottom:5px"><i class="icon-play icon-white pull-left"></i> Play'+
				'</button><br/>'+
				'<button class="btn btn-info btn-mini" type="button" style="width:65px;margin-bottom:5px;clear:both"><i class="icon-share icon-white pull-left"></i> Share'+
				'</button><br/>'+
				'<button class="btn btn-info btn-mini" type="button" style="width:65px;margin-bottom:5px;clear:both"><i class="icon-edit pull-left icon-white"></i> Edit'+
				'</button>'+
				'<label class="checkbox" style="font-weight:bold"><input type="checkbox" name="show_in_archive"> Show in Archive?</label>'+

			'</div>';

			
			return html;
		},
		

});

})(jda.module("items"));