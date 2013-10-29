(function(Browser) {

	Browser.Views = Browser.Views || {};

	Browser.Views._Fancybox = Backbone.View.extend({

		tagName:'div',
		id:'fancybox-media-container',

		initialize: function(){
			console.log(this.model,'initialize')
			var _this = this;
			this.collection = jda.app.myCollectionsDrawer.collection;
			if(!_.isUndefined(_gaq)) _gaq.push(["_trackEvent", "JDA-Item", "View", this.model.id.toString()]);
      if (window.location.href.indexOf("/ja/") != -1) {
        this.language = "ja";
      } else {
        this.language = "en";
      }
      this.translations = {
        "ja" : {
          translation : "翻訳",
          editTranslation : "翻訳を修正する",
          submitTranslation : "翻訳する"
        },
        "en" : {
          translation : "Translation",
          editTranslation : "Edit Translation",
          submitTranslation : "Submit Translation"
        }
      };
		},

		events : {
			'click .show-translate' : 'showTranslate',
			'click .submitTranslation' : 'submitTranslation',
			'click .jda-share-link input' : function(){
				$('.jda-share-link input').select();
			}
		},
		beforeClose: function(){

		},

		afterShow:function()
		{

			this.locatorMapView.addMap();

			var _this = this;

			$(this.el).find('.tagsedit').empty().tagsInput({
				'interactive':true,
				'defaultText':l.fancybox_addtag,
				'onAddTag':function(){_this.updateTags('',_this);},
				'onRemoveTag':function(){_this.updateTags('',_this);},
				'removeWithBackspace' : false,
				'minChars' : 1,
				'maxChars' : 0,
				'placeholderColor' : '#C0C0C0'
			});

			$(this.el).find('.jda-show-share-link').click(function(){_this.shareLink();});

			if(!this.model.get('editable')){$('.tag').find('a').hide();}

			var attributes = this.model.get('attributes');

			if (!(attributes instanceof Object)) {
			    this.model.save({ attributes: {} });
			}
			$(this.el).find('.translationheader').show();
			$(this.el).find('.submittranslationheader').hide();
			$(this.el).find('.translation-wrapper').hide();
			$(this.el).find('.show-translate').show();
			$(this.el).find('.translationtext-wrapper').show();

			/***********************************
				ADD TO COLLECTION LINK
				Only show if they are logged in and not looking at a collection page already
			***********************************/
			if(sessionStorage.getItem('user')===0 || jda.app.resultsView.collectionFilter !== null){
				$('.jda-add-to-menu').hide();

			} else{

					var myCollections = $(_this.el).find('.fancybox-my-collections-list');

					_.each( _.toArray(this.collection), function(item){
						var id,title;
						if(!_.isUndefined(item.id)) id =item.id;
						else id = -1;

						if(item.get('title').length>25) title = item.get('title').substr(0,23)+'...';
						else title = item.get('title');

						var itemView = '<li class="zeega-collection-list-item" id="'+id+'"><a href=".">'+title+'</a></li>';
						myCollections.append(itemView);

					});

					//Save collection with new item
					$(_this.el).find('.zeega-collection-list-item').click(function(){

						$(_this.el).find('.jda-add-to-menu').removeClass('open');
						$(_this.el).find('.jda-saving').show();

						var collectionID = $(this).attr("id");
						var itemID = _this.model.id;

						var collection = _this.collection.get(collectionID);

						var itemExists = false;
						var kids =_.toArray( collection.get('child_items'));
						for (var i=0;i<kids.length;i++){
							if(kids[i].id == itemID){
								itemExists=true;
								break;
							}
						}
						if (!itemExists){

							collection.save({new_items:[itemID ]},
									{
										success : function(model, response){
											//_this.collection.reset();
											$(_this.el).find('.jda-saving').hide();
											$(_this.el).find('.jda-added').show().delay(800).fadeOut(400);

											//update my collection drawer preview
											if (collection.id == jda.app.myCollectionsDrawer.activeCollectionID){
												jda.app.myCollectionsDrawer.renderCollectionPreview(collection);
											}

										},
										error : function(model, response){
											console.log(response);

										}
									}
								);
						} else{
							$(_this.el).find('.jda-saving').hide();
							$(_this.el).find('.jda-duplicate-item').show().delay(800).fadeOut(400);

						}
						return false;
					});


			}
		},
		showTranslate: function(e)
		{
      $('.translationheader').hide();
      $('.submittranslationheader').show();
      $('.translation-wrapper').show();
      $('.show-translate').hide();
      $('.translationtext-wrapper').hide();
      jQuery.fancybox.toggleKeys();
      e.preventDefault();
    },
		updateTags:function(name, _this)
		{
			model = _this.model;
			var tags = [];
      // use .find() go as deep as needed in the DOM
			$("#"+_this.elemId+"_tagsinput").find(".tag").each(function () {
			  tags.push($(this).contents().eq(0).text().trim());
			});
			_this.model.save({tags : tags});
		},
		submitTranslation:function()
		{
      var translation = $(this.el).find('.translationinsert').val().trim();

      if (translation == "") {
          alert('Please enter a translation before submitting');
          return;
      }

      var attributes = this.model.get('attributes');
      if (attributes instanceof Object && !Array.isArray(attributes)) {
          attributes.translation = translation;
      } else {
          attributes = { translation: translation };
      }
      this.model.save({ attributes: attributes });
      $(this.el).find('.translationtext-wrapper > p').text(translation);

			$('.translationheader').show();
      $('.submittranslationheader').hide();
			$('.show-translate').show();
 			$('.translationtext-wrapper').show();
		 	$('.translation-wrapper').hide();
      jQuery.fancybox.toggleKeys();
		},
		more : function(){

			var _this=this;
			sessionStorage.setItem('moreFancy', true);
			$(this.el).find('.less').hide();
			$(this.el).find('.more').fadeIn('fast');
			$(this.el).find('.plyr-video').css({'height':'200px'});
			$(this.el).find(".fancybox-shrinkable").addClass("fancybox-media-wrapper-more");
			$(this.el).find(".fancybox-media-wrapper").addClass("fancybox-media-wrapper-more");
			$(this.el).find(".fancybox-left-column").addClass("fancybox-left-column-more");
			$(this.el).find(".fancybox-media-item").addClass("fancybox-media-item-more");
			$(this.el).addClass("fancybox-media-container-more");

			//Show delete button in More view if user added this item
			console.log(sessionStorage.getItem("userid") + ' is session nid');
			console.log(this.model.get("user_id") + ' is mode; nid');

			if(this.model.get("editable")){
				$(this.el).find('.fancybox-delete-button').show();
			} else{
				$(this.el).find('.fancybox-delete-button').hide();
			}

			return false;
		},

		less : function()
		{
			sessionStorage.setItem('moreFancy', false);
			$(this.el).find('.more').hide();
			$(this.el).find('.less').show();
			$(this.el).find('.plyr-video').css({'height':'400px'});
			$(this.el).find(".fancybox-media-wrapper").removeClass("fancybox-media-wrapper-more");
			$(this.el).find(".fancybox-left-column").removeClass("fancybox-left-column-more");
			$(this.el).find(".fancybox-media-item").removeClass("fancybox-media-item-more");
			$(this.el).removeClass("fancybox-media-container-more");
			return false;
		},
		shareLink : function(){
			$('.jda-share-link').toggle();
			$('.jda-show-share-link').toggleClass('active');
			$('.jda-share-link').find('input').select();
		},
		render: function(obj)
		{

      this.elemId = Math.floor(Math.random()*10000);
			/** Temp Fix **/
			var blanks = {
				sourceLink : this.model.get('uri'),
				title : this.model.get('title') == "none" ? this.model.get('layer_type') : this.model.get('title'),
				description : this.model.get('description'),
				creator : this.model.get('media_creator_username'),
				tags : this.model.get('tags'),
				text : this.model.get('text').replace(/\r\n/gi, '<br/>'),
				randId: this.elemId
			};

			var attributes = this.model.get('attributes');

			if (attributes.translation) {
        blanks.translation = attributes.translation;
        blanks.translationEditText = attributes.translation;
			} else {
        blanks.translation = "None Submitted";
        blanks.translationEditText = "";
			}

			blanks.sourceText = l.fancybox_source;

			blanks.itemShareLink = sessionStorage.getItem('hostname')+sessionStorage.getItem('locale')+'/item/'+ this.model.id;

			//use template to clone the database items into
			var template = _.template( this.getTemplate() );

			//copy the cloned item into the el
			$(this.el).append( template( blanks ) );

			// Add map view
			var Browser = jda.module('browser');
			this.locatorMapView = new Browser.Views.LocatorMap({ model : this.model });
			$(this.el).find('.geo').append(this.locatorMapView.render());

			//Fancybox will remember if user was in MORE or LESS view
			//if (sessionStorage.getItem('moreFancy') == "true") this.more(this.el);
			//else this.less(this.el);

			this.more(this.el);

			if(this.model.get('editable')){

				var _this=this;
				//EDIT TITLE
				$(this.el).find('.title').editable(
					function(value, settings)
					{
						_this.model.save({ title:value },
								{
									success: function(model, response) {
										console.log("Updated item title for item " + model.id);
									},
									error: function(model, response){

										console.log("Error updating item title.");
										console.log(response);
									}
								});
						return value; //must return the value
					},
					{
						tooltip   : 'Click to edit...',
						indicator : '<img src="images/loading.gif">',
						select : false,
						onblur : 'submit',
						width : 250,
						cssclass : 'fancybox-form'
				});
				//EDIT DESCRIPTION
				$(this.el).find('.description').editable(
					function(value, settings)
					{
						_this.model.save({ description:value },
								{
									success: function(model, response) {
										$(_this.el).find('.description').text(_this.model.get("description"));
										console.log("Updated item description for item " + _this.model.id);
									},
									error: function(model, response){

										console.log("Error updating item description.");
										console.log(response);
									}
								});
						return value; //must return the value
					},
					{
						type : 'textarea',
						tooltip : 'Click to edit description...',
						indicator : '<img src="images/loading.gif">',
						select : false,
						onblur : 'submit',
						width : 250,
						cssclass : 'fancybox-form'
				});
				//EDIT CREATOR
				$(this.el).find('.creator').editable(
					function(value, settings)
					{
						_this.model.save({ "media_creator_username":value },
								{
									success: function(model, response) {
										console.log("Updated item creator for item " + _this.model.id);
									},
									error: function(model, response){

										console.log("Error updating item creator.");
										console.log(response);
									}
								});
						return value; //must return the value
					},
					{
						tooltip   : 'Click to edit...',
						indicator : '<img src="images/loading.gif">',
						select : false,
						onblur : 'submit',
						width : 150,
						cssclass : 'fancybox-form'
				});

				$(this.el).find('.no-do-not-delete').click(function(e){
					$('.fancybox-delete-button').show();
					$('.fancybox-confirm-delete-button').hide();
					e.preventDefault();
				});
				$(this.el).find('.yes-confirm-delete').click(function(e){

					var deleteURL = sessionStorage.getItem('hostname')+sessionStorage.getItem('directory') + "api/items/" + _this.model.id;

					//DESTROYYYYYYYY
					_this.model.destroy({
										url : deleteURL,
										success: function(model, response)
										{
											console.log("Deleted item " + _this.model.id);
											//close fancy box window
											jQuery.fancybox.close();

										},
										error: function(model, response)
										{
											console.log("Error deleting item " + _this.model.id);
											console.log(response);
										}
									});
					e.preventDefault();
				});

				//DELETE button
				$(this.el).find('.fancybox-delete-button').click(function(e){
					$(this).hide();
					$('.fancybox-confirm-delete-button').show();
					e.preventDefault();
				});

			}


			$(this.el).find('.close').click(function(){
				jQuery.fancybox.close();
			});

			return this;
		},
		getTemplate : function()
		{

			var html =		'<div class="fancybox-close-button"><a class="close">&times;</a></div>'+
							'<div class="fancybox-media-wrapper">'+
							'<div class="fancybox-left-column">' +
								/* Share & Add to collection buttons */
								'<div style="margin-bottom:3px">'+
									'<button class="btn btn-mini btn-inverse pull-left jda-show-share-link" ><i  class="icon-share-alt icon-white"></i>'+l.fancybox_link+'</button> '+
									'<div class="btn-group jda-add-to-menu pull-left">'+
										'<a class="btn btn-mini btn-inverse dropdown-toggle" data-toggle="dropdown" href="#">'+
											l.fancybox_addto +
											'<span class="caret"></span>'+
										'</a>'+
										'<ul class="dropdown-menu fancybox-my-collections-list">'+
										'</ul>'+
									'</div><span class="label label-info jda-saving" style="display:none;margin-left:3px">Saving...</span><span class="label label-success jda-added" style="display:none;margin-left:3px">Added</span><span  style="display:none;margin-left:3px" class="label label-warning jda-duplicate-item">Duplicate</span>'+
								'</div>'+
								'<div class="jda-share-link">'+
									'<input type="text" value="<%= itemShareLink %>">'+
								'</div>'+

								/* Media Item */
								'<div class="fancybox-media-item media-item" style="clear:both"></div>'+

								/* Map */
								'<div id = "fancybox-map" class="more geo"></div>'+


							'</div>'+
							'<p class="fancybox-editable title" style="text-transform: uppercase;"><%= title %></p>'+
							'<p><span class=" creator fancybox-editable"><%= creator %></span> <span class="source"><a href="<%= sourceLink %>" target="_blank"><%= sourceText %></a></span></p>'+
							'<div class="fancybox-right-column">'+

								'<div class="description-wrapper">'+
									'<p class="more subheader">'+l.fancybox_description+'</p><p class="more description fancybox-editable"><%= description %></p>'+
								'</div>'+
								'<div class="tags-wrapper">'+
									'<p class="more subheader" >'+l.fancybox_tags+'</p>'+
									'<div id="zeega-tag-container" class="more zeega-tags">'+
										'<input name="tags" class="more fancybox-editable tagsedit" id="<%=randId%>" value="<%=tags%>" />'+
									'</div>'+
							'</div>'+
								'<div class="text-wrapper">'+
									'<p class="more subheader">'+l.fancybox_text+'</p><p class="more description fancybox-editable"><%= text %></p>'+
								'</div>'+
                // translation stuff
              '<p class="translationheader more subheader">' + this.translations[this.language].translation + '</p>' +
              '<p class="submittranslationheader more subheader">' + this.translations[this.language].submitTranslation + '</p>' +
              '<div class="translationtext-wrapper">'+
              '<p class="more description fancybox-editable"><%= translation %></p>'+
              '</div >'+
              '<div style="text-align:left">'+
              '<button class="show-translate btn btn-info btn-medium">' + this.translations[this.language].editTranslation + '</button>' +
              '</div >'+
              '<div style="display: none; text-align:left" class="translation-wrapper">'+
              '<textarea style="width : 90%" class="translationinsert"><%= translationEditText %></textarea>' + '<button class="submitTranslation btn btn-info btn-medium">' + "submit" + '</button>' +
              '</div>'+

                '</div>'
						'</div>'+
						'<div class="fancybox-buttons" class="clearfix">'+
							'<p class="fancybox-delete-button more" style="display:none"><a href=".">delete</a></p>'+
							'<p class="fancybox-confirm-delete-button">are you totally sure you want to delete this? '+
							'<a href="." class="yes-confirm-delete">yes</a> <a class="no-do-not-delete" href=".">no</a></p>'+

						'</div>';

			return html;
		}
	});

})(jda.module("browser"));
