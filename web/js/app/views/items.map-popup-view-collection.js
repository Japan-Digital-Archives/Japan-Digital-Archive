(function(Items) {
	Items.MapPoppupViewCollection = Backbone.View.extend({
		className : 'discovery-map-list-container',

		initialize : function()
		{
			var _this = this;
			this._childViews = [];
			this.render();
		},

		render : function()
		{
			var _this = this;
			_this._isRendered = true;
			list = $("<ul class='discovery-map-list'></ul>");
			$(this.el).append(list);
			_.each( _.toArray(this.collection), function(item){
				var itemView = new Items.Views.MapPopup({model:item});
				//_this._childViews.push(itemView);
				list.append( itemView.render().el );
			});
			return this;
		}
	});
})(jda.module("items"));