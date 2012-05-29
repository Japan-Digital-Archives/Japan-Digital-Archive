(function(Items) {

	Items.MyCollectionsDrawer = Backbone.View.extend({
		el : $('#zeega-my-collections'),
		

		initialize : function()
		{
			
			this.collection = new Items.Collection();

			this.collection.search = 	{		
				page:1,
				r_itemswithcollections: 0,
				r_items:1,
				r_tags:1,
				content:'collection',
				user : -1

			};
			//this.collection.on( 'reset', this.reset, this);
		},

		render : function()
		{
			var _this = this;
			_.each( _.toArray(this.collection), function(item){
				var itemView = '<li><a href="#">'+item.get('title')+'</a></li>';
				$(_this.el).find('.dropdown-menu').append(itemView);
			});
			
			return this;
		},
		getCollectionList : function()
		{
			var _this = this;
			
			// fetch list of collections for drawer drop-down
			// if user has no collections then make a new 'my collection'
			// but don't save until they add something to it
			this.collection.fetch({
				
				success : function(model, response)
				{ 
					_this.render();
				},
				error : function(model, response)
				{ 
					console.log('Error getting collection list from server');
					
				}
			}
			);
			
			
			
		},

	});
})(jda.module("items"));