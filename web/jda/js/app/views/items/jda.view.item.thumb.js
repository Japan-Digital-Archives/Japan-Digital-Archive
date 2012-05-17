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

	        //this is for fancy box to know to group these into a gallery
	        $(this.el).attr("rel", "group");
	        
    	},
		render: function(done)
		{
			var _this = this;

			var template = this.getDefaultTemplate();
			var blanks = this.model.attributes;
			
			$(this.el).html( _.template( template, blanks ) );
			if (this.model.get('media_type') == 'Tweet' || this.model.get('thumbnail_url').length ==0)
			{

				$(this.el).find('img').replaceWith(	'<i class="jdicon-'+ this.model.get('media_type').toLowerCase() +
													' jda-centered-icon"></i>');
			}
			if (this.model.get('media_type') == 'Collection')
			{
				$(this.el).find('.label').show();
				$(this.el).hover(
					function(){
						$(_this.el).find('img').css('opacity','1.0');
					},function(){
						$(_this.el).find('img').css('opacity','0.8');
					}
				);
			} else{
				$(this.el).popover({'title':this.model.get('title'), 'content':this.model.get('description'), 'delay':{ show: 2000, hide: 100 },'placement':'bottom'});
			
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
		
		
		getDefaultTemplate : function()
		{
			html = 
			
				'<a href="#" class="thumbnail" style="width:160px;height:120px">'+
					'<i class="jdicon-small-drag" style="z-index:2"></i>'+
					'<span class="label label-inverse" style="display:none;position: absolute;top: 57px;left: 50px;z-index:2" rel="tooltip" title="Go to Collection View">'+
					'<i class="icon-folder-open icon-white"></i> <%= child_items_count%> items</span>'+
					'<img src="<%=thumbnail_url%>" alt="<%=title%>" style="width:160px;height:120px;opacity:0.8">'+
					
				'</a>';

			
			return html;
		}
		
	});
	
})(jda.module("items"));