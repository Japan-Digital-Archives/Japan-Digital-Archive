(function(Browser) {

	Browser.Views = Browser.Views || {};
	Browser.Views.FancyBox = Browser.Views.FancyBox || {};
	
	Browser.Views.FancyBox.Image = Browser.Views._Fancybox.extend({
		
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

			//Fill in image-specific stuff
			var blanks = {
				src : this.model.get('uri'),
				title : this.model.get('title')
			};

			//use template to clone the database items into
			var template = _.template( this.getMediaTemplate() );

			//copy the cloned item into the el
			var imageHTML =  template( blanks ) ;

			$(this.el).find('.fancybox-media-item').html(imageHTML);

			//set fancybox content
			obj.content = $(this.el);

			return this;
		},
		getMediaTemplate : function()
		{

			var html =	'<img src="<%=src%>" title="<%=title%>" alt="<%=title%>"/>';
			return html;
		}
	});
	
})(jda.module("browser"));