(function(Browser) {
	Browser.Items = Browser.Items || {};
	Browser.Items.Collections = Browser.Items.Collections || {};
	Browser.Items.Collections.Views =  Browser.Items.Collections.Views || {};
	
	
	
	Browser.Items.Collections.Views.MapPopup = Backbone.View.extend({
		
		className : 'discovery-map-list-container',

		initialize : function()
		{
			var _this = this;
			this.render();
		},

		render : function()
		{
			var _this = this;
			_this._isRendered = true;
			list = $("<ul class='discovery-map-list'></ul>");
			$(this.el).append(list);
			_.each( _.toArray(this.collection), function(item){
				var itemView = new Browser.Items.Views.MapPopup({model:item});
				list.append( itemView.render().el );
			});
			return this;
		}
	});
})(jda.module("browser"));