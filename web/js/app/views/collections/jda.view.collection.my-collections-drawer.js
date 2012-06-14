(function(Browser) {
	
	Browser.Items = Browser.Items || {};
	Browser.Items.Collections = Browser.Items.Collections || {};
	Browser.Items.Collections.Views =  Browser.Items.Collections.Views || {};
	
	
	Browser.Items.Collections.Views.MyCollectionsDrawer = Backbone.View.extend({
		
		el : $('#zeega-my-collections'),
		
		initialize : function(){
			
			this.collection = new Browser.Items.Collection();
            this.collection.url=jda.app.apiLocation + 'api/search?r_collections=1&user=-1';			
                        this.collection.parse= function(data)
				{
					console.log(data.collections);
					return data.collections;
				}
			//show 3 thumbnails by default in collections drawer
			this.showThumbnailCount = 3;
			
			
			
		},

		render : function(){
			var _this = this;

			//Render collection list in drop-down menu
			$(_this.el).find('.dropdown-menu').empty();
			
			if(sessionStorage.getItem('user')==1)$(_this.el).find('.dropdown-menu').append('<li class="zeega-collection-list-item" ><a href=".">Create A New Collection</a></li><li class="divider"></li>');
			_.each( _.toArray(this.collection), function(item){
			
				if(!_.isUndefined(item.id)) var id =item.id;
				else id = -1;
				
				if(item.get('title').length>25) var title = item.get('title').substr(0,23)+'...';
				else var title = item.get('title');
				
				var itemView = '<li class="zeega-collection-list-item" id="'+id+'"><a href=".">'+title+'</a></li>';
				$(_this.el).find('.dropdown-menu').append(itemView);
				
				$(_this.el).find('#'+id).click( function(e){
					if ($(this).attr('id') != _this.activeCollectionID){
						
						var title =$(this).find('a').html();
						if(title.length>20) title=title.substr(0,15)+"...";
						$('#zeega-my-collections-active-collection').text(title);
						$('#zeega-my-collections-items-thumbs li').fadeTo(100,.2);
						$('#zeega-my-collections-items-thumbs').spin();
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
				
				this.activeCollection = new Items.Model({
					title:$('#zeega-my-collections-active-collection').text(),
					child_items:[],
					new_items:[],
				});
				this.activeCollection.set({title:$('#zeega-my-collections-active-collection').text()}); 
				this.activeCollection.set({child_items:[]}); 
				this.activeCollection.set({new_items:[]}); 
				
			}
			
			/* 
				Otherwise make the first collection in the list the active one for the
				my Collection drawer
			*/
			
			else {
				var activeCollectionID = this.collection.at(0).id;
				console.log('active collection id:',activeCollectionID);
				this.switchActiveCollection(activeCollectionID);
			}
			
			

			$(this.el).find('#zeega-my-collections-items').droppable({
			    accept : '.list-fancymedia',
			    hoverClass : 'zeega-my-collections-items-dropping',
			    tolerance : 'pointer',

			    drop : function( event, ui ){
			    
			    	//TODO -- Check whether user is logged in - if not then log them in before adding
					if(sessionStorage.getItem('user')!=1){
						$(_this.el).find('#zeega-my-collections-items').addClass('zeega-my-collections-items-dropping');
					
						_this.activeCollection.attributes.child_items.push(jda.app.draggedItem.toJSON());
						_this.renderCollectionPreview(_this.activeCollection);
	
						var newItems = _this.activeCollection.attributes.new_items.push(jda.app.draggedItem.id);
						
						
						_.delay(function(){$(_this.el).find('#zeega-my-collections-items').removeClass('zeega-my-collections-items-dropping');},1000);
					
					}
					else if(_.difference([jda.app.draggedItem.id],_.pluck(_this.activeCollection.attributes.child_items,"id")).length==0){
						
						console.log('duplicate');
						
					}
				
					else {
						
						$(_this.el).find('#zeega-my-collections-items').addClass('zeega-my-collections-items-dropping');
					
						_this.activeCollection.attributes.child_items.push(jda.app.draggedItem.toJSON());
						_this.renderCollectionPreview(_this.activeCollection);
						  
						var itemId=jda.app.draggedItem.id;
						
						_this.activeCollection.url=jda.app.apiLocation + 'api/items/' + _this.activeCollection.id+'/items';
				
						
						_this.activeCollection.save({new_items:[itemId ]},
								{
									success : function(model, response){ 
										
										$(_this.el).find('#zeega-my-collections-items').removeClass('zeega-my-collections-items-dropping');
										_this.renderCollectionPreview(model);	
									},
									error : function(model, response){
										console.log(response);
		
									}
								}
							);
						}
					ui.draggable.draggable('option','revert',false);
					
			    }
			});
			  
	
			return this;
		},
		
		switchActiveCollection :function(activeCollectionID){
			var _this = this;
			
			
			if(!_.isUndefined(activeCollectionID)) 
			
			{
				this.activeCollection = new Browser.Items.Model({id:activeCollectionID});
				
				this.activeCollection.fetch(
				{
					//Display the first x thumbnails in the collection
					success : function(model, response)
					{ 
						
						_this.renderCollectionPreview(model);
						
					},
					error : function(model, response)
					{ 
						console.log('Error getting active collection for collections drawer');
	
					}
				});
			}
			else{
				this.activeCollection = new Browser.Items.Model({
					title:$('#zeega-my-collections-active-collection').text(),
					child_items:[],
					new_items:[],
					
				});
				$('#zeega-my-collections-items').spin(false );
			}
		},
		
		renderCollectionPreview: function(model){
					
					
					
					console.log('RENDERING COLLECTION PREVIEW',model);
					var title = model.get('title');
					var remainingItems = model.get('child_items').length - this.showThumbnailCount;
					var _this=this;
					
					$('#zeega-my-collections-items-thumbs').empty();
					
						var title =model.get('title');
						if(title.length>20) title=title.substr(0,15)+"...";
						
						
					$('#zeega-my-collections-active-collection').text(title);
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
					
					if(sessionStorage.getItem('user')!=1){
						$('#zeega-my-collections-share-and-organize').html("<a href='#' >Save Collection</a>").click(function(){
							$('#sign-in').trigger('click'); 
						}).show();
					}
					else{
					$('#zeega-my-collections-share-and-organize').html("<a href='#' >Share and Organize</a>").unbind().click(function(){
						jda.app.addFilter(_this.activeCollection, 'collection');
						return false;
						}).show();
					}
					
					var kids = _.toArray(model.get('child_items'));
					for (var i=1;i<=Math.min(this.showThumbnailCount, kids.length);i++){
						var item = kids[kids.length-i];
						
						var itemView = new Browser.Items.Views.Thumb({model:new Browser.Items.Model(item)});
						itemView.model.set({thumbnail_width:120, thumbnail_height:80});
						itemView.render();
						$('#zeega-my-collections-items-thumbs').append(itemView.el);

					}
		},
		
		getCollectionList : function(){
			var _this = this;
			
			// fetch list of collections for drawer drop-down
			// if user has no collections then make a new 'my collection'
			// but don't save until they add something to it
			
			
			if(sessionStorage.getItem('user')==1){
				
				console.log('user authenticated: fetching user collections');
				this.collection.fetch({
					
					success : function(collection, response)
					{ 
						console.log('SUCCESSFULLY LOADED COLLECTIONS',collection);
						_this.render();
					},
					error : function(collection, response)
					{ 
						console.log(response);
						console.log('Error getting collection list from server');
	
					}
				}
				);
			}
			else{
				console.log('user not authenticated: creating empty collection');
				this.collection.add(
					new Browser.Items.Model({
						title:$('#zeega-my-collections-active-collection').text(),
						child_items:[],
						new_items:[],
					}));
				console.log(this.collection);
				this.render();			
			}
			
			
			
			
		},
		
		createNewCollection : function(){
		
		
		
		
		
		}

	});
})(jda.module("browser"));
