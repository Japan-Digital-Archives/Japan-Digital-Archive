(function(Items) {

	// This will fetch the tutorial template and render it.
	Items.Views.MapPopup = Backbone.View.extend({
		
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
				default:
					template = this.getDefaultTemplate();
			}
			
			var blanks = this.model.attributes;
		
			
			blanks.id=this.model.get("id").split('.')[1];
			$(this.el).html( _.template( template, blanks ));
			return this;
		},
		getTweetTemplate : function()
		{
			html =
			'<a  class="map-fancymedia" id="<%= id %>" rel="group">'+
			'<div style="float:left;">'+
				'<img  src="<%= thumbnail_url %>" height="50" width="50"/>'+
			'</div>'+
			'<div class="span popup-text">'+
				'<%= text %>'+
			'</div>'+
			'</a>';

			return html;
		},
		getDefaultTemplate : function()
		{
			html =
			'<a  class="map-fancymedia" id="<%= id %>" rel="group">'+
			'<div style="float:left;">'+
				'<img  src="<%= thumbnail_url %>" height="50" width="50"/>'+
			'</div>'+
			'<div class="span popup-text">'+
				'<%= title %>'+
			'</div>'+
			'</a>';

			return html;
		}		
	});

})(jda.module("items"));