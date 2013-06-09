(function(Browser) {

	Browser.Views = Browser.Views || {};
	Browser.Views.FancyBox = Browser.Views.FancyBox || {};
	
	Browser.Views.FancyBox.Testimonial = Browser.Views._Fancybox.extend({


		initialize: function(){

			Browser.Views._Fancybox.prototype.initialize.call(this); //This is like calling super()

		},

		/* Pass in the element that the user clicked on from fancybox. */
		render: function(obj)
		{
			console.log("rendering a testimonial!!!!")
			//Call parent class to do captioning and metadata
			Browser.Views._Fancybox.prototype.render.call(this, obj); //This is like calling super()

			
			$(this.el).find('.fancybox-media-item').css({"height":"5px"});
			$(this.el).find('.description-wrapper').hide();
			$(this.el).find('.title').html(this.model.get("title"));
			if (this.model.get('attributes')) {
			    if (this.model.get('attributes').privacy) {
			        if (this.model.get('attributes').privacy == 'Hide') {
			            $(this.el).find('.creator').html("Anonymous");
			        }
			    }
			}
			//set fancybox content
			obj.content = $(this.el);

			return this;
		}

	});

})(jda.module("browser"));