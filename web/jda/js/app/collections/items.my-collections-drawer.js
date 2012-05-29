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
			
		},

		render : function()
		{
			var _this = this;
			_.each( _.toArray(this.collection), function(item){
				var itemView = '<li class="zeega-collection-list-item" id="'+item.id+'"><a href="#">'+item.get('title')+'</a></li>';
				$(_this.el).find('.dropdown-menu').append(itemView);
			});
			this.setActiveCollection();
			return this;
		},
		setActiveCollection : function(){

			/* 
				If they don't have any collections then make a new one but
				don't save it till they add to it
			*/
			if ($(this.el).find('.zeega-collection-list-item').length == 0){
				//create new "my collection"
				//don't save yet
				//this.activeCollectionID = -1
			} 
			/* 
				Otherwise make the first collection in the list the active one for the
				my Collection drawer
			*/
			else {
				var activeCollectionID = $(this.el).find('.zeega-collection-list-item').first().attr("id");
				var theUrl = jda.app.apiLocation + 'api/items/'+ activeCollectionID;

				this.activeCollection = new Items.Model({id:activeCollectionID});
				this.activeCollection.url = theUrl;

				console.log('Fetching active collection from ' + theUrl);
				this.activeCollection.fetch(
				{
				
					success : function(model, response)
					{ 
						var title = model.get('title');
						$('#zeega-my-collections-active-collection').text(model.get('title'));
					},
					error : function(model, response)
					{ 
						console.log('Error getting active collection for collections drawer');

					}
				});
			}
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