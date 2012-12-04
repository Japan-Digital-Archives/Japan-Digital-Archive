(function(Browser) {

	Browser.Items = Browser.Items || {};
	Browser.Items.Views = Browser.Items || {};
	
	Browser.Items.Views.MapPopup = Backbone.View.extend({
		
		tagName : 'li',
		className : 'map-popup-list-items',

		render: function(done)
		{
			var _this = this;
			var template;
			
			switch( this.model.get('media_type') )
			{
				
				case 'Tweet':
					template = this.getTweetTemplate();
					break;
				case 'Image':
					template = this.getImageTemplate();
					break;
				case 'Collection':
					template = this.getCollectionTemplate();
					break;
				default:
					template = this.getDefaultTemplate();
			}
			var blanks = jQuery.extend({}, this.model.attributes);
			
			
			//temp fix
			
			
			console.log(this.model);
			
			blanks.id=this.model.id;
			
			if (this.model.get("media_creator_realname") == null || this.model.get("media_creator_realname") == "" || this.model.get("media_creator_realname") == "Unknown" || this.model.get("media_creator_realname") == "unknown"){
				blanks["author"] = this.model.get("media_creator_username");
			} else {
				blanks["author"] = this.model.get("media_creator_realname");	
			}
			if (blanks.media_type !=null) blanks.media_type = blanks.media_type.toLowerCase();
			

			$(this.el).html( _.template( template, blanks ));

			if(this.model.get('media_type')=="Collection"){
			
				$(this.el).click(function(){jda.app.addFilter(_this.model, 'collection'); return false;});
			
			}

			if (blanks["author"] == ""){
				$(this.el).find('.item-author').hide();
			}
			return this;
		},
		getTweetTemplate : function()
		{
			html =
			'<a  class="map-fancymedia" id="<%= id %>" rel="group">'+
			'<div class="map-popup-icon-container" style="float:left;">'+
			'<div class="map-popup-tweet-icon"></div>'+
			'</div>'+
			'<div>'+
				'<%= text %>'+
			'</div>'+
			'</a>';

			return html;
		},
		getImageTemplate : function()
		{
			html =
			'<a  class="map-fancymedia" id="<%= id %>" rel="group">'+
			'<div class="map-popup-icon-container" style="float:left;">'+
				'<img  src="<%= thumbnail_url %>" height="50" width="50"/>'+
			'</div>'+
			'<div>'+
				'<div class="item-title"><%= title %></div>'+
				'<div class="item-author">by <%= author %></div>'+
			'</div>'+
			'</a>';

			return html;
		},
		getCollectionTemplate : function()
		{
			html =
			'<a  id="<%= id %>" href="#view_type=list&collection=885025&content=all&" rel="group">'+
			'<div class="map-popup-icon-container" style="float:left;">'+
				'<i class="jdicon-<%=media_type%>"></i>'+
			'</div>'+
			'<div>'+
				'<div class="item-title"><%= title %></div>'+
				'<div class="item-author">by <%= author %></div>'+
			'</div>'+
			'</a>';

			return html;
		},
		getDefaultTemplate : function()
		{
			html =
			'<a  class="map-fancymedia" id="<%= id %>" rel="group">'+
			'<div class="map-popup-icon-container" style="float:left;">'+
				'<i class="jdicon-<%=media_type%>"></i>'+
			'</div>'+
			'<div>'+
				'<div class="item-title"><%= title %></div>'+
				'<div class="item-author">by <%= author %></div>'+
			'</div>'+
			'</a>';

			return html;
		}		
	});

})(jda.module("browser"));