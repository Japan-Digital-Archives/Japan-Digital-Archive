(function(Items) {

	//This is for the description/title info of a collection that shows up at the top of the page
	Items.Views.CollectionPage = Backbone.View.extend({
		
		el : $('#jda-collection-filter'),
		
		

		events: {
			'click button:contains(Play)' : function(){alert('Plays slideshow');},
			'click button:contains(Share)' : function(){alert('Opens publish process modal window');},
			'click button:contains(Edit)' : function(){alert('Opens fancybox item viewer');},
			

		    
		 },
		 initialize: function () {
	      //  this.model.bind('remove', this.remove);
	       
	        
    	},
		render: function(done)
		{
			var _this = this;

			var facetExists = false;

			//first remove other collection filters
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				if (facet.model.get("category")=="collection" && facet.model.get("value") != this.model.get('title')) {
					facet.model.set({'value': null });
					facet.remove();
				} else if (facet.model.get("category")=="collection" && facet.model.get("value") == this.model.get('title')){
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

			//Push down main results content
			$('.tab-content').addClass('jda-low-top');
			$('#zeega-right-column').addClass('zeega-right-column-low');

			//Assemble template
			var template = this.getTemplate();
			var blanks = this.model.attributes;
			
			$(this.el).html( _.template( template, blanks ) );
			if (this.model.get('description').length > 255){
				$(this.el).find('.icon-plus-sign').show();
			}
			return this;
		},
		remove:function(){

			//remove from DOM
			$(this.el).empty();

			
			//reset height of main results content & my collections
			$('.tab-content').removeClass('jda-low-top');
			$('#zeega-right-column').removeClass('zeega-right-column-low');
			

			
		},
		
		getTemplate : function()
		{
			html = 
			
				
                  '<div class="span4">'+
                  		'<div class="pull-left zeega-collection rotated-left" style="margin-right:12px">'+
                        	'<img src="<%=thumbnail_url%>" alt="" style="width:160px;height:120px;">'+
                        '</div>'+
                        '<h3><%=title%></h3>'+
                        '<p><br/><strong>by Lindsey Wagner</strong></p>'+

                  '</div>'+
                  '<div class="span6">'+
                        
                        '<%=description%><i class="icon-plus-sign" style="display:none"></i>'+
                        '<p><strong>Tokyo, Japan</strong></p>'+
                        
                        
                  '</div>'+
                  '<div class="span2">'+           
                          '<button class="btn btn-info btn-mini" type="button" style="width:65px;margin-bottom:5px"><i class="icon-play icon-white pull-left"></i> Play'+
                          '</button><br/>'+
                          '<button class="btn btn-info btn-mini" type="button" style="width:65px;margin-bottom:5px;clear:both"><i class="icon-share icon-white pull-left"></i> Share'+
                          '</button><br/>'+
                          '<button class="btn btn-info btn-mini" type="button" style="width:65px;clear:both"><i class="icon-edit pull-left icon-white"></i> Edit'+
                          '</button>'+
                  
                  '</div>';

			
			return html;
		}
		
	});
	
})(jda.module("items"));