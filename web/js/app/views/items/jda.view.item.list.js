(function(Browser) {

	Browser.Items = Browser.Items || {};
	Browser.Items.Views = Browser.Items || {};
	
	Browser.Items.Views.List = Backbone.View.extend({
		
		tagName : 'tr',
		
		className:'list-fancymedia',
		//className : 'row',

		events: {

		    //'click': function(){alert('hi');},
		    'mouseenter':function () {
		    				
						    $(this.el).css('color','#08c');
						    $(this.el).css('cursor','move');
						    $(this.el).find('.jdicon-small-drag').show();
						    
						  },
			'mouseleave':function () {
							
						    $(this.el).css('color','inherit');
						    $(this.el).css('cursor','auto');
						    $(this.el).find('.jdicon-small-drag').hide();
						   
						  },
		 },
		 initialize: function () {
	        
	        this.el.id = this.model.id;

	        //this is for fancy box to know to group these into a gallery
	        $(this.el).attr("rel", "group");

	        //list item has a thumbnail item with same model as a subview
	        this.thumbnailView = new Browser.Items.Views.Thumb({model:this.model,thumbnail_width:100,thumbnail_height:80,show_caption:false,fancybox:false});
	        
    	},
		render: function(done)
		{
			var _this = this;

			var template;
			switch( this.model.get('media_type') )
			{
				case 'Image':
					template = this.getImageTemplate();
					break;
				case 'Document':
					template = this.getDefaultTemplate();
					break;
				case 'Website':
					template = this.getWebsiteTemplate();
					break;
				case 'Tweet':
					template = this.getTweetTemplate();
					break;
				case 'Text':
					template = this.getTestimonialTemplate();
					break;
				case 'Video':
					template = this.getDefaultTemplate();
					break;
				case 'Audio':
					template = this.getDefaultTemplate();
					break;
				case 'PDF':
					template = this.getDefaultTemplate();
					break;
				case 'Collection':
					template = this.getCollectionTemplate();
					break;
				
				default:
					template = this.getDefaultTemplate();
			}
			
			
		
			var blanks = this.model.attributes;
				
			if (this.model.get("media_date_created") != null){
				blanks["media_date"] = new Date(this.model.get("media_date_created").replace(" ", "T"));
				blanks["media_date"]=blanks["media_date"].format("mmmm dS, yyyy<br/>h:MM TT");
			} else {
				blanks["media_date"] = "n/a";
			}
			if (this.model.get("text") != null){
				var excerpt = this.model.get("text").replace(/\r\n/gi, '<br/>');;
				blanks["text"] = this.linkifyTweet(excerpt);

			}
			if (this.model.get("description") == null){
				blanks["description"] = " ";
			}
			if (this.model.get("description") != null && this.model.get("description").length > 255){
				blanks["description"] = this.model.get("description").substring(0,255) + "...";
			} 
			if (this.model.get("title") == null || this.model.get("title") == "none" || this.model.get("title") == ""){
				blanks["title"] = "Untitled";
			}
			if (this.model.get("media_type") == "PDF" && (this.model.get('title') == "none" || this.model.get('title') == "Untitled" || this.model.get('title') == ""  || this.model.get('title') == "&nbsp;" || this.model.get('title') == null)){
				blanks["title"] = "Untitled";
			}
			if (this.model.get("media_creator_realname") == null || this.model.get("media_creator_realname") == "" || this.model.get("media_creator_realname") == "Unknown" || this.model.get("media_creator_realname") == "unknown"){
				blanks["author"] = this.model.get("media_creator_username");
			} else {
				blanks["author"] = this.model.get("media_creator_realname");	
			}
			if (this.model.get("media_type") == "Text" && this.model.get('description').length < this.model.get('text').length){
				blanks["description"] = this.model.get('description') + '...';
			}
			$(this.el).html( _.template( template, blanks ) );
			
			$(this.el).find('.zeega-item-thumbnail').append(this.thumbnailView.render().el);

			if (blanks["author"] == ""){
				$(this.el).find('.jda-item-author').hide();
			}

			$(this.el).draggable({

			    cursor : 'move',
			    cursorAt : { 
				top : -5,
				left : -5
				},
			    appendTo : 'body',
			    opacity : .8,

			    helper : function(){
			      var drag = $(this).find('.thumbnail')
			      .clone()
			      .css({
			      	
			        'z-index':'3',

			      });
			      return drag;
			    },

			      //init the dragged item variable
			      start : function(){
			        $(this).draggable('option','revert',true);
			        jda.app.draggedItem = _this.model;
			      },

			      stop : function(){

			      }
			      
			});
			$(this.el).find(".jdicon-small-drag").tooltip({'title':'Drag to add to your collection','placement':'bottom', delay: { show: 600, hide: 100 }});

			return this;
		},
		
		/* formats tweet text, doesn't linkify bc tweet is already linked to fancybox */
		linkifyTweet : function(tweet){

			// urls
			var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	    	tweet = tweet.replace(exp,"<strong>$1</strong>"); 

	    	// users
	    	 tweet = tweet.replace(/(^|)@(\w+)/gi, function (s) {
	        	return '<strong>' + s + '</strong>';
	    	});

	    	// tags
	    	tweet = tweet.replace(/(^|)#(\w+)/gi, function (s) {
	        	return '<strong>' + s + '</strong>';
	     	});

	    	return tweet;
		},
		
		getImageTemplate : function()
		{
			html =


			'<td class="zeega-list-left-column">'+
				'<div class="zeega-item-thumbnail"></div>'+
			'</td>'+
			'<td class="zeega-list-middle-column">'+
				'<h3><%= title %></h3><p class="jda-item-author">by: <%= author %> via <a><%= archive %></a></p>'+
				'<p class="jda-item-description"><%= description %></p>'+
			'</td>'+
			'<td class="zeega-list-right-column jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';
			

			
			return html;
		},
		getDefaultTemplate : function()
		{
			html =


			'<td class="zeega-list-left-column">'+
				'<div class="zeega-item-thumbnail"></div>'+
			'</td>'+
			'<td class="zeega-list-middle-column">'+
				'<h3><%= title %></h3><p class="jda-item-author">by: <%= author %></p>'+
				'<p class="jda-item-description"><%= description %></p>'+
			'</td>'+
			'<td class="zeega-list-right-column jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';
			

			
			return html;
		},
		getDocumentTemplate : function()
		{
			html = 
			


			'<td class="span2">'+
			//	'<i class="jdicon-small-drag"></i>'+

				'<i class="jdicon-document"></i>'+
				'<div class="item-author item-author-left"><%= author %></div>'+
			'</td>'+
			'<td class="jda-item-description">'+
				'<div class="jda-item-title"><%= title %></div>'+
				'<div><%= description %></div>'+
			'</td>'+
			'<td class="jda-item-date">'+
				'<%= media_date %><input class="jda-item-checkbox" type="checkbox">'+
			'</td>';

			
			return html;
		},
		getWebsiteTemplate : function()
		{
			html = 


			'<td class="zeega-list-left-column">'+
				'<div class="zeega-item-thumbnail"></div>'+
			'</td>'+
			'<td class="zeega-list-middle-column">'+
				'<h3><%= title %></h3><p class="jda-item-author"><a href="<%= attribution_uri %>" target="_blank"><%= attribution_uri %></a></p>'+
				'<p class="jda-item-description"><%= description %></p>'+
			'</td>'+
			'<td class="zeega-list-right-column jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';
			
			
			return html;
		},
		getTweetTemplate : function()
		{
			html = 

			'<td class="zeega-list-left-column">'+
				'<div class="zeega-item-thumbnail"></div>'+
			'</td>'+
			'<td class="zeega-list-middle-column">'+
				'<p class="jda-item-description"><%= text %></p>'+
			'</td>'+
			'<td class="zeega-list-right-column jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';
			
			return html;
		},
		getTestimonialTemplate : function()
		{
			html = 
			'<td class="zeega-list-left-column">'+
				'<div class="zeega-item-thumbnail"></div>'+
			'</td>'+
			'<td class="zeega-list-middle-column">'+
				'<h3><%= title %></h3><p class="jda-item-author">Testimonial by: <%= author %></p>'+
				'<p class="jda-item-description"><%= description %></p>'+
			'</td>'+
			'<td class="zeega-list-right-column jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';

			
			return html;
		},
		
	
		
		getCollectionTemplate : function()
		{
			html = 

				'<td class="zeega-list-left-column">'+
				'<div class="zeega-item-thumbnail"></div>'+
				'</td>'+
				'<td class="zeega-list-middle-column">'+
					'<h3><%= title %></h3><p class="jda-item-author">by: <a><%= author %></a></p>'+
					'<p class="jda-item-description"><%= description %></p>'+
				'</td>'+
				'<td class="zeega-list-right-column jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';
				


			
			return html;
		},
		getDefaultTemplate : function()
		{
			html = 
			

				'<td class="zeega-list-left-column">'+
					'<div class="zeega-item-thumbnail"></div>'+
				'</td>'+
				'<td class="zeega-list-middle-column">'+
					'<h3><%= title %></h3><p class="jda-item-author">by: <%= author %></p>'+
					'<p class="jda-item-description"><%= description %></p>'+
				'</td>'+
				'<td class="zeega-list-right-column jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';
				

			
			return html;
		}
		
	});
	
})(jda.module("browser"));