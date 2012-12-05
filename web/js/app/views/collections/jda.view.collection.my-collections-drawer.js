(function(Browser) {
	
	Browser.Items = Browser.Items || {};
	Browser.Items.Collections = Browser.Items.Collections || {};
	Browser.Items.Collections.Views =  Browser.Items.Collections.Views || {};
	
	
	Browser.Items.Collections.Views.MyCollectionsDrawer = Backbone.View.extend({
		
		el : $('#zeega-my-collections'),
		
		initialize : function(){
			
			$('#zeega-my-collections-spinner').spin(true);

			this.collection = new Browser.Items.Collection();
            this.collection.url=jda.app.apiLocation + 'api/items/search?q=type:Collection&user=-1';			
            this.collection.parse= function(data){ return data.items;}
			
			if(sessionStorage.getItem('user')!=0)this.user=sessionStorage.getItem('user');
			else this.user=null;
			console.log(this.user,"IS THE USER");
			//show 3 thumbnails by default in collections drawer
			this.showThumbnailCount = 3;
		},

		render : function(){
			var _this = this;

			//Render collection list in drop-down menu
			$(this.el).find('.dropdown-menu').empty();
			
			if(!_.isNull(this.user))$(this.el).find('.dropdown-menu').append('<li class="zeega-collection-list-item" ><a class="new-collection" href="#"><i class="icon-plus"></i> '+l.jda_collection_createnew+'</a></li><li class="divider"></li>');
			
			
			_.each( _.toArray(this.collection), function(item){
				var id,title;
				if(!_.isUndefined(item.id)) id =item.id;
				else id = -1;
				if(item.get('title').length>25) title = item.get('title').substr(0,23)+'...';
				else title = item.get('title');
				
				var itemView = '<li class="zeega-collection-list-item" id="'+id+'"><a href=".">'+title+'</a></li>';
				$(_this.el).find('.dropdown-menu').append(itemView);
				

			});
			
			$(_this.el).find('.zeega-collection-list-item').unbind().click( function(e){
					if ($(this).attr('id') != _this.activeCollectionID){
						var title =$(this).find('a').html();
						if(title.length>20) title=title.substr(0,15)+"...";
						$('#zeega-my-collections-active-collection').text(title);
						$('#zeega-my-collections-items-thumbs li').fadeTo(100,0.2);
						$('#zeega-my-collections-items-thumbs').spin();
						_this.switchActiveCollection($(this).attr('id'));
					}
					e.preventDefault();
			});
			
			
			
			
			
			/*
				If they don't have any collections then make a new one but
				don't save it till they add to it
			*/
			
			$(this.el).find('.new-collection').click(function(){ _this.createNewCollection(); return false; });
			
			if (this.collection.length===0){
				
				this.activeCollection = new Browser.Items.Model({
					title:$('#zeega-my-collections-active-collection').text(),
					child_items:[],
					new_items:[],
					editable:true
				});
				
				this.activeCollection.save({},{success:function(model,response){
					_this.activeCollectionID=model.id;
				}});
			}
			
			/*
				Otherwise make the first collection in the list the active one for the
				my Collection drawer
			*/
			
			else {
				var activeCollectionID = this.collection.at(0).id;
				this.switchActiveCollection(activeCollectionID);
			}
			
			

			$(this.el).find('#zeega-my-collections-items').droppable({
				accept : '.thumb-fancymedia, .list-media',
				hoverClass : 'zeega-my-collections-items-dropping',
				tolerance : 'pointer',

				drop : function( event, ui ){
					if(_.isNull(_this.user)){
						$(_this.el).find('#zeega-my-collections-items').addClass('zeega-my-collections-items-dropping');
					
						_this.activeCollection.attributes.child_items.push(jda.app.draggedItem.toJSON());
						_this.renderCollectionPreview(_this.activeCollection);
	
						var newItems = _this.activeCollection.attributes.new_items.push(jda.app.draggedItem.id);
						
						
						_.delay(function(){$(_this.el).find('#zeega-my-collections-items').removeClass('zeega-my-collections-items-dropping');},1000);
					
					}
					else if(_.difference([jda.app.draggedItem.id],_.pluck(_this.activeCollection.attributes.child_items,"id")).length===0){
						
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

			$('#zeega-my-collections-spinner').spin(false);
			return this;
		},
		
		switchActiveCollection :function(activeCollectionID){
			var _this = this;
			
			
			if(!_.isUndefined(activeCollectionID))
			{
				this.activeCollectionID=activeCollectionID;
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
					new_items:[]
				});
				$('#zeega-my-collections-items').spin(false );
			}
		},
		
		renderCollectionPreview: function(model){
					
					
					
					
					var remainingItems = model.get('child_items').length - this.showThumbnailCount;
					var _this=this;
					
					$('#zeega-my-collections-items-thumbs').empty();
					
					var title =model.get('title');
					if(title.length>20) title=title.substr(0,15)+"...";
					$('#zeega-my-collections-active-collection').text(title);
					
					
					
					
					$('#zeega-my-collections-count').text(remainingItems);

					if (model.get('child_items').length === 0){
						$(this.el).find('#zeega-my-collections-drag-items-here,.jdicon-drag').show();
						$('#zeega-my-collections-share-and-organize').empty();
					} else{
						$(this.el).find('#zeega-my-collections-drag-items-here,.jdicon-drag').hide();
					}

					if (remainingItems > 0) $('#zeega-my-collections-count-string').show();
					else $('#zeega-my-collections-count-string').hide();
					
					console.log("current user",this.user);
					if(_.isNull(this.user)){
						$('#zeega-my-collections-share-and-organize').html("<a href='#' >"+l.jda_collection_save+"</a>").click(function(){
							$('#sign-in').trigger('click');
						}).show();
					}
					else if( model.get('child_items').length >0){
						$('#zeega-my-collections-share-and-organize').html("<a href='#' >"+l.jda_collection_goto+"</a>").unbind().click(function(){
							//_this.activeCollection.set('editable',true);
							//jda.app.addFilter(_this.activeCollection, 'collection');
							
							jda.app.goToCollection(_this.activeCollection.id);
							return false;
						}).show();
					}
			
					var kids = _.toArray(model.get('child_items'));
					for (var i=1;i<=Math.min(this.showThumbnailCount, kids.length);i++){
						var item = kids[kids.length-i];
						
						var itemView = new Browser.Items.Views.Thumb({model:new Browser.Items.Model(item),thumbnail_width:100,thumbnail_height:80,show_caption:false,fancybox:false,draggable:false});
						itemView.model.set({thumbnail_width:100, thumbnail_height:80});
						itemView.render();
						$('#zeega-my-collections-items-thumbs').append(itemView.el);
				
					}
					$('#zeega-my-collections-items-thumbs .jda-delete-item').remove();
					$('#zeega-my-collections-items-thumbs .thumbnail').css({cursor:"default"});
					
		},
		
		getCollectionList : function(){
			var _this = this;
			
			// fetch list of collections for drawer drop-down
			// if user has no collections then make a new 'my collection'
			// but don't save until they add something to it
			
			
			if(!_.isNull(this.user)){
				

				this.collection.fetch({
					
					success : function(collection, response)
					{
						_this.render();
					},
					error : function(collection, response)
					{
						console.log(response);
					}
				}
				);
			}
			else{
				this.collection.add(
					new Browser.Items.Model({
						title:$('#zeega-my-collections-active-collection').text(),
						child_items:[],
						new_items:[]
					}));
				this.render();
			}
		},
		
		createNewCollection : function(){
			$('#zeega-my-collections-items-thumbs li').fadeTo(100,0.2);
			$('#zeega-my-collections-items-thumbs').spin();
			$('#zeega-my-collections-share-and-organize a').empty();
			$('#zeega-my-collections').find('.dropdown-toggle').trigger('click');
			var _this=this;
			this.activeCollection = new Browser.Items.Model({
				title:"new collection "+Math.floor(Math.random()*1000),
				child_items:[],
				new_items:[],
				editable:true
			});
			this.renderCollectionPreview(this.activeCollection);
			
			this.activeCollection.save({},{
				success:function(model,response){
					var title;
					_this.collection.add(model);
					if(model.get('title').length>25) title = model.get('title').substr(0,23)+'...';
					else title = model.get('title');
					$('#zeega-my-collections').find('.divider').after('<li class="zeega-collection-list-item" id="'+model.id+'"><a href=".">'+title+'</a></li>');
					_this.activeCollectionID=model.id;
					$(_this.el).find('.zeega-collection-list-item').unbind().click( function(e){
						
						if ($(this).attr('id') != _this.activeCollectionID){
							var title =$(this).find('a').html();
							if(title.length>20) title=title.substr(0,15)+"...";
							$('#zeega-my-collections-active-collection').text(title);
							$('#zeega-my-collections-items-thumbs li').fadeTo(100,0.2);
							$('#zeega-my-collections-items-thumbs').spin();
							_this.switchActiveCollection($(this).attr('id'));
						}
						e.preventDefault();
					});
				}
			});
			return false;
		}

	});
})(jda.module("browser"));
