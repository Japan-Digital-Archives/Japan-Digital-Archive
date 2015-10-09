// Ensures start of address is http, not https
function toHttp(uri) {
  var pattern = /^https?(.+)$/;
  var match = uri.match(pattern);
  return match ? "http"+match[1] : uri;
}

// Extracts the video id from a YouTube link
function fixYoutubeUri(uri) {
  var parts = uri.split('http');
  var original_src = "http"+parts[parts.length-1];
  // Matches http://(www.)?youtube.com/watch?v=(.+)
  var yt_url = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=(.+)$/;
  var yt_match = original_src.match(yt_url);
  if (yt_match) {
    return yt_match[1];
  } else {
    return false;
  }
}

// Extracts the video id from a Vimeo link
function fixVimeoUri(uri) {
  var parts = uri.split('http');
  var original_src = "http"+parts[parts.length-1];
  // Together, these two regexes match http://(www.)?vimeo.com(.*)/[0-9]+
  var vm_url_hd = /^https?:\/\/(?:www\.)?vimeo.com\/(.+)$/;
  var vm_url_tl = /\d+$/;
  var vm_match_hd = original_src.match(vm_url_hd);
  if (vm_match_hd && original_src.match(vm_url_tl)) {
    return vm_match_hd[1];
  } else {
    return false;
  }
}

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
                var layer_type = this.model.get("layer_type").toLowerCase();
                if (layer_type.lastIndexOf("outside-", 0) === 0) {
		    layer_type = layer_type.substring(8);
		}
		switch( layer_type )
			{
				case 'youtube':
                                        var uri = this.model.get('uri');
                                        var yt_id = fixYoutubeUri(uri);
					source = "http://www.youtube.com/watch?v="+(yt_id === false ? uri : yt_id);
					this.plyr = new Plyr('fancybox-video-'+this.unique,{url:source});
					
					break;
				case 'vimeo':
                                        var uri = this.model.get('uri');
                                        var vm_id = fixVimeoUri(uri);
					source = "http://vimeo.com/"+(vm_id === false ? uri : vm_id);
					this.plyr = new Plyr('fancybox-video-'+this.unique,{url:source,controls:0});
					break;
                                default:
                                        source = toHttp(this.model.get('uri'));
                                        this.plyr = new Plyr('fancybox-video-'+this.unique,{url:source});
                                        break;			
			}
		
		
		
	},
	
	beforeClose: function(){
		if (this.plyr != null)
		{
		this.plyr.pop.pause();
		this.plyr.destroy();
		}

	}
});
	
})(jda.module("browser"));
