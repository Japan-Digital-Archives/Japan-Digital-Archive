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

			$(this.el).find('.description-wrapper').html(tweetHTML);
			$(this.el).find('.fancybox-media-item').css({"height":"5px"});
			$(this.el).find('.text-wrapper').hide();
			$(this.el).find('.title').html(l.fancybox_tweet);
      $(this.el).find('span.source > a').attr("href", this.model.get("attribution_uri"));
			//set fancybox content
			obj.content = $(this.el);

			return this;
		},

		getMediaTemplate : function()
		{

			var html =	'<p class="more subheader" style="">'+l.fancybox_text+'</p><p class="fancybox-tweet"><%= tweet %></p>';

			return html;
		}

	});

})(jda.module("browser"));
