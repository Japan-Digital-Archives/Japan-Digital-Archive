(function(Browser) {

	Browser.Views = Browser.Views || {};
	Browser.Views.FancyBox = Browser.Views.FancyBox || {};
	
	Browser.Views.FancyBox.Video = Browser.Views._Fancybox.extend({
		initialize: function()
		{
			Browser.Views._Fancybox.prototype.initialize.call(this); //This is like calling super()
		},
		
		/* Pass in the element that the user clicked on from fancybox. */
		
	/* Pass in the element that the user clicked on from fancybox. */
	render: function(obj)
	{
		
		sessionStorage.setItem('currentItemId', this.model.id);
		
		//Call parent class to do captioning and metadata
		Browser.Views._Fancybox.prototype.render.call(this, obj); //This is like calling super()
		
		
		this.unique =Math.floor(Math.random() *10000);
		$(this.el).find('.fancybox-media-item').append($('<div>').attr({id:'fancybox-video-'+this.unique}).addClass('fancybox-shrinkable'));
		$(this.el).find('.text-wrapper').hide();

		//set fancybox content
		obj.content = $(this.el);
		
		return this;
	},
	afterShow:function(){
		
		Browser.Views._Fancybox.prototype.afterShow.call(this);
		var source;
		switch( this.model.get("layer_type") )
			{

				case 'Video':
					source = this.model.get('uri');
					this.plyr = new Plyr('fancybox-video-'+this.unique,{url:source});
					break;
				case 'Youtube':
					source = "http://www.youtube.com/watch?v="+this.model.get('uri');
					this.plyr = new Plyr('fancybox-video-'+this.unique,{url:source});
					
					break;
				case 'Vimeo':
					source = "http://vimeo.com/"+this.model.get('uri');
					this.plyr = new Plyr('fancybox-video-'+this.unique,{url:source,controls:0});
					break;
			
			}
		
		
		
	},
	
	beforeClose: function(){
		this.plyr.pop.pause();
		this.plyr.destroy();

	}
});
	
})(jda.module("browser"));