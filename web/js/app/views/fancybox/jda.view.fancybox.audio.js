(function(Browser) {

	Browser.Views = Browser.Views || {};
	Browser.Views.FancyBox = Browser.Views.FancyBox || {};
	
	Browser.Views.FancyBox.Audio = Browser.Views._Fancybox.extend({
		initialize: function()
		{
			Browser.Views._Fancybox.prototype.initialize.call(this); //This is like calling super()
			
		},
		/* Pass in the element that the user clicked on from fancybox.  */
		/* Pass in the element that the user clicked on from fancybox. */
		render: function(obj)
		{
			
			sessionStorage.setItem('currentItemId', this.model.id);
			
			//Call parent class to do captioning and metadata
			Browser.Views._Fancybox.prototype.render.call(this, obj); //This is like calling super()

			this.unique =Math.floor(Math.random() *10000);
			$(this.el).find('.fancybox-media-item').append($('<div id="fancybox-video-'+this.unique+'">'));
			$(this.el).find('.text-wrapper').hide();


			//set fancybox content
			
			obj.content = $(this.el);
			return this;
		},
		afterShow:function(){

			Browser.Views._Fancybox.prototype.afterShow.call(this); //This is like calling super()
			var source = this.model.get('uri');
			this.plyr = new Plyr('fancybox-video-'+this.unique,{url:source});
			//$(this.el).find('video').hide();//css({'height':'0','margin-top':'31px'});
			$(this.el).find('.plyr-video').css({height:'29px'});
		},
		
		beforeClose: function(){
			this.plyr.pop.pause();
			this.plyr.destroy();

		}
		
	});
	
})(jda.module("browser"));