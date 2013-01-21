(function(Browser) {

	Browser.Views = Browser.Views || {};
	Browser.Views.FancyBox = Browser.Views.FancyBox || {};
	
	Browser.Views.FancyBox.Bookmark = Browser.Views._Fancybox.extend({
		
		initialize: function()
		{
			Browser.Views._Fancybox.prototype.initialize.call(this); //This is like calling super()
		},
		
		/* Pass in the element that the user clicked on from fancybox. */
		render: function(obj)
		{

			sessionStorage.setItem('currentItemId', this.model.id);
			//console.log('this model id is'+this.model.id);
			//Call parent class to do captioning and metadata
			Browser.Views._Fancybox.prototype.render.call(this, obj); //This is like calling super()

			$(this.el).find('.text-wrapper').hide();
			$(this.el).find('.fancybox-media-item').css({"height":"5px"});

			//set fancybox content
			obj.content = $(this.el);

			return this;
		}
	});
	
})(jda.module("browser"));