(function(Items) {

	// This will fetch the tutorial template and render it.
	Items.Views.Thumb = Backbone.View.extend({
		
		tagName : 'li',
		
		className:'list-fancymedia',

		events: {

		    //'click': function(){alert('hi');},
		    'mouseenter':function () {
		    				
						    $(this.el).css('color','#08c');
						    $(this.el).css('cursor','move');
						    $(this.el).find('.jdicon-small-drag').show();
						    
						  },
			'mouseleave':function () {
							
						    $(this.el).css('color','inherit');
						    $(this.el).css('cursor','auto');
						    $(this.el).find('.jdicon-small-drag').hide();
						   
						  },
		 },
		 initialize: function () {
	        
	        this.el.id = this.model.id;

	        //set default size for thumbnails
	        if (!this.model.get('thumbnail_width')){
	        	this.model.set({thumbnail_width:160, thumbnail_height:120});
	        }

	        //this is for fancy box to know to group these into a gallery
	        $(this.el).attr("rel", "group");
	        
    	},
		render: function(done)
		{
			var _this = this;

			var template = (this.model.get('media_type') == 'Collection' ? this.getCollectionTemplate() : this.getDefaultTemplate());
			var blanks = this.model.attributes;
			
			$(this.el).html( _.template( template, blanks ) );

			//if no thumbnail or if it's a tweet then just show the grey icon instead of thumb
			if (this.model.get('media_type') == 'Tweet' || this.model.get('thumbnail_url') == null || this.model.get('thumbnail_url').length ==0 && !_.isUndefined(this.model.get('media_type')))
			{

				$(this.el).find('img').replaceWith(	'<i class="jdicon-'+ this.model.get('media_type') +
													' jda-centered-icon"></i>');
			}
			if (this.model.get('media_type') == 'Collection')
			{
				$(this.el).find('.label').show();
				
				$(this.el).find('.label').click(function(){
					jda.app.addFilter(_this.model, 'collection');
					$(this).tooltip('hide');
					return false;
				});
				
			} else{
				//Turning this off because buggy
				//$(this.el).popover({'title':this.model.get('title'), 'content':this.model.get('description'), 'delay':{ show: 2000, hide: 100 },'placement':'bottom'});
			
			}
			$(this.el).draggable({

			    cursor : 'move',
			    appendTo : 'body',
			    opacity : .8,

			    helper : function(){
			      var drag = $(this)
			      .clone()
			      .css({
			      	'width':'940px',
			        'z-index':'3',

			      });
			      return drag;
			    },

			      //init the dragged item variable
			      start : function(){
			        $(this).draggable('option','revert',true);
			        jda.app.draggedItem = _this.model;
			        
			      },

			      stop : function(){

			      }
			      
			});
			$(this.el).find(".jdicon-small-drag").tooltip({'title':'Drag to add to your collection','placement':'bottom', delay: { show: 600, hide: 100 }});
			$(this.el).find(".label").tooltip({'placement':'bottom', delay: { show: 600, hide: 100 }});
			

			//Replace broken thumbnail images with the media type icon
			$(this.el).find('img').error(function() {
			  $(_this.el).find('img').replaceWith(	'<i class="jdicon-'+ _this.model.get('media_type').toLowerCase() +
													'" style="position: relative;top: 35px;left: 55px;"></i>');
			});
			return this;
		},
		
		getCollectionTemplate : function()
		{
			var html = 
			
				'<a href="#" class="thumbnail zeega-collection rotated-left">'+
					'<i class="jdicon-small-drag" style="z-index:2"></i>'+
					'<span class="label label-inverse" style="display:none;position: absolute;top: 91px;left:126px;z-index:2" rel="tooltip" title="Go to Collection View">'+
					'<i class="icon-share-alt icon-white"></i></span>'+
					'<img src="<%=thumbnail_url%>" alt="<%=title%>" style="width:<%=thumbnail_width%>px;height:<%=thumbnail_height%>px">'+
					'<input class="jda-item-checkbox" type="checkbox">'+
				'</a>';

			
			return html;
		},
		getDefaultTemplate : function()
		{

			var html = 
			
				'<a href="#" class="thumbnail" style="width:<%=thumbnail_width%>px;height:<%=thumbnail_height%>px;background-color:white">'+
					'<i class="jdicon-small-drag" style="z-index:2"></i>'+
					'<img src="<%=thumbnail_url%>" alt="<%=title%>" style="width:<%=thumbnail_width%>px;height:<%=thumbnail_height%>px">'+	
					'<input class="jda-item-checkbox" type="checkbox">'+
				'</a>';

			
			return html;
			
		}
		
	});
	
})(jda.module("items"));