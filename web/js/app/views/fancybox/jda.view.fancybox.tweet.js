(function(Browser) {

	Browser.Views = Browser.Views || {};
	Browser.Views.FancyBox = Browser.Views.FancyBox || {};
	
	Browser.Views.FancyBox.Tweet = Browser.Views._Fancybox.extend({
		
		initialize: function()
		{
			Browser.Views._Fancybox.prototype.initialize.call(this); //This is like calling super()
		},
		
		
		
		/* Pass in the element that the user clicked on from fancybox. */
		render: function(obj)
		{
			//Call parent class to do captioning and metadata
			Browser.Views._Fancybox.prototype.render.call(this, obj); //This is like calling super()
			var tweet = this.model.get('text');

			//Fill in tweet-specific stuff
			var blanks = {
				tweet : linkifyTweet(tweet),
			};

			//use template to clone the database items into
			var template = _.template( this.getMediaTemplate() );

			//copy the cloned item into the el
			var tweetHTML =  template( blanks ) ;

			$(this.el).find('.fancybox-media-item').html(tweetHTML);

			//set fancybox content
			obj.content = $(this.el);

			return this;
		},
		
		getMediaTemplate : function()
		{

			var html =	'<p class="fancybox-tweet"><%= tweet %></p>';

			return html;
		}
		
	});
	
})(jda.module("browser"));