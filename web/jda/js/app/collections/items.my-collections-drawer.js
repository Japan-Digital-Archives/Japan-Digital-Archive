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

			//show 3 thumbnails by default in collections drawer
			this.showThumbnailCount = 3;
			
			
			
		},

		render : function()
		{
			var _this = this;

			//Render collection list in drop-down menu
			$(_this.el).find('.dropdown-menu').empty();

			_.each( _.toArray(this.collection), function(item){
				var itemView = '<li class="zeega-collection-list-item" id="'+item.id+'"><a href=".">'+item.get('title')+'</a></li>';
				$(_this.el).find('.dropdown-menu').append(itemView);
				
				$(_this.el).find('#'+item.id).click( function(e){
					if ($(this).attr('id') != _this.activeCollectionID){
						_this.switchActiveCollection($(this).attr('id'));
						e.preventDefault();
					}
				});
			});
			/* 
				If they don't have any collections then make a new one but
				don't save it till they add to it
			*/
			if ($(this.el).find('.zeega-collection-list-item').length == 0){
				
				this.activeCollection = new Items.Model();
				this.activeCollection.set({title:$('#zeega-my-collections-active-collection').text()}); 
			} 
			/* 
				Otherwise make the first collection in the list the active one for the
				my Collection drawer
			*/
			else {
				var activeCollectionID = $(this.el).find('.zeega-collection-list-item').first().attr("id");
				this.switchActiveCollection(activeCollectionID);

			
			}

			$(this.el).find('#zeega-my-collections-items').droppable({
			    accept : '.list-fancymedia',
			    hoverClass : 'zeega-my-collections-items-dropping',
			    tolerance : 'pointer',


			    drop : function( event, ui )
			    {
			    	//TODO -- Check whether user is logged in - if not then log them in before adding
			      
			      var kids = _.toArray(_this.activeCollection.get('child_items'));
			      kids.push(jda.app.draggedItem.toJSON());
			      _this.activeCollection.set('child_items', kids);

			      _this.activeCollection.save(
			      		{},
				      	{success : function(model, response)
						{ 
							//_this.activeCollection = model;
							_this.render();
						},
						error : function(model, response){

						}}
			      );
			      
			      
			      ui.draggable.draggable('option','revert',false);

			    }
			});
			  
	
			return this;
		},
		switchActiveCollection :function(activeCollectionID){
			var _this = this;
			this.activeCollection = new Items.Model({id:activeCollectionID});

			
			this.activeCollection.fetch(
			{
				//Display the first x thumbnails in the collection
				success : function(model, response)
				{ 
					var title = model.get('title');
					var remainingItems = model.get('child_items').length - _this.showThumbnailCount;
					
					$('#zeega-my-collections-items-thumbs').empty();
					$('#zeega-my-collections-active-collection').text(model.get('title'));
					$('#zeega-my-collections-count').text(remainingItems);

					if (model.get('child_items').length == 0){
						$('#zeega-my-collections-drag-items-here,.jdicon-drag').show();
					} else{
						$('#zeega-my-collections-drag-items-here,.jdicon-drag').hide();
					}

					if (remainingItems > 0){
						$('#zeega-my-collections-count-string').show();
					} else {
						$('#zeega-my-collections-count-string').hide();	
					}
					$('#zeega-my-collections-share-and-organize').click(function(){
						jda.app.addFilter(_this.activeCollection, 'collection');
						return false;
					});
					$('#zeega-my-collections-share-and-organize').show();
					
					var kids = _.toArray(model.get('child_items'));
					
					for (var i=0;i<Math.min(_this.showThumbnailCount, kids.length);i++){
						var item = kids[i];
						
						var itemView = new Items.Views.Thumb({model:new Items.Model(item)});
						itemView.model.set({thumbnail_width:120, thumbnail_height:80});
						itemView.render();
						$('#zeega-my-collections-items-thumbs').append(itemView.el);

					}

					
				},
				error : function(model, response)
				{ 
					console.log('Error getting active collection for collections drawer');

				}
			});
			
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