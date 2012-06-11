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
					template = this.getDocumentTemplate();
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
					template = this.getVideoTemplate();
					break;
				case 'Audio':
					template = this.getAudioTemplate();
					break;
				case 'PDF':
					template = this.getPDFTemplate();
					break;
				case 'Collection':
					template = this.getCollectionTemplate();
					break;
				
				default:
					template = this.getDefaultTemplate();
			}
			
			
		
			var blanks = this.model.attributes;
				
			if (this.model.get("media_date_created") != null && this.model.get("media_date_created") != "0000-00-00 00:00:00"){
				blanks["media_date"] = new Date(this.model.get("media_date_created").replace(" ", "T"));
				blanks["media_date"]=blanks["media_date"].format("ddd, mmm dS, yyyy<br/>h:MM:ss TT Z");
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
				blanks["title"] = "&nbsp;";
			}
			if (this.model.get("media_type") == "PDF" && (this.model.get('title') == "none" || this.model.get('title') == "Untitled" || this.model.get('title') == ""  || this.model.get('title') == "&nbsp;" || this.model.get('title') == null)){
				blanks["title"] = "Untitled";
			}
			if (this.model.get("media_creator_realname") == null || this.model.get("media_creator_realname") == "" || this.model.get("media_creator_realname") == "Unknown" || this.model.get("media_creator_realname") == "unknown"){
				blanks["author"] = this.model.get("media_creator_username");
			} else {
				blanks["author"] = this.model.get("media_creator_realname");	
			}

			$(this.el).html( _.template( template, blanks ) );

			if (blanks["author"] == ""){
				$(this.el).find('.jda-item-author').hide();
			}

			$(this.el).draggable({

			    cursor : 'move',
			    appendTo : 'body',
			    opacity : .8,

			    helper : function(){
			      var drag = $(this)
			      .clone()
			      .css({
			      	'width':'940px',
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


			'<td class="span2">'+
		//		'<i class="jdicon-small-drag"></i>'+
			'<img src="<%= thumbnail_url %>" height="100" width="100"/>'+

			'</td>'+
			'<td class="jda-item-description"><%= title %><br/><span class="jda-item-author">by <%= author %></span></td>'+
			'<td class="jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';
			

			
			return html;
		},
		getVideoTemplate : function()
		{
			html =


			'<td class="span2">'+
		//		'<i class="jdicon-small-drag"></i>'+
				'<img src="<%= thumbnail_url %>" height="100" width="100"/>'+

			'</td>'+
			'<td class="jda-item-description">'+
				'<div class="jda-item-title"><%= title %></div>'+
				'<div class="jda-item-source"><%= layer_type %></div>'+
				'<div class="jda-item-author">by <%= author %></div>'+
			'</td>'+
			'<td class="jda-item-date">'+
				'<%= media_date %><input class="jda-item-checkbox" type="checkbox">'+
			'</td>';
			
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


			'<td class="span2">'+
			//	'<i class="jdicon-small-drag"></i>'+

				'<i class="jdicon-website"></i>'+
			'</td>'+
			'<td class="jda-item-description">'+
				'<div class="jda-item-title"><%= title %></div>'+
			'</td>'+
			'<td class="jda-item-date">'+
				'<%= media_date %><input class="jda-item-checkbox" type="checkbox">'+
			'</td>';
			
			return html;
		},
		getTweetTemplate : function()
		{
			html = 


			'<td class="span2">'+
			//	'<i class="jdicon-small-drag"></i>'+

				'<i class="jdicon-tweet"></i>'+
			'</td>'+
			'<td class="jda-item-description">'+
				'<%= text %>'+
			'</td>'+
			'<td class="jda-item-date">'+
				'<%= media_date %><input class="jda-item-checkbox" type="checkbox">'+
			'</td>';
			
			return html;
		},
		getTestimonialTemplate : function()
		{
			html = 


			'<td class="span2">'+
				//'<i class="jdicon-small-drag"></i>'+

				'<i class="jdicon-testimonial"></i>'+
				'<div class="item-author item-author-left"><%= author %></div>'+
			'</td>'+
			'<td class="jda-item-description">'+
				'<div><%= description %></div>'+
			'</td>'+
			'<td class="jda-item-date">'+
				'<%= media_date %><input class="jda-item-checkbox" type="checkbox">'+
			'</td>';
			
			return html;
		},
		getPDFTemplate : function()
		{
			html = 

D
			'<td class="span2">'+
				//'<i class="jdicon-small-drag"></i>'+

				'<i class="jdicon-pdf"></i>'+
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
	
		getAudioTemplate : function()
		{
			html = 


			'<td class="span2">'+
				//'<i class="jdicon-small-drag"></i>'+

				'<i class="jdicon-audio"></i>'+
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
		getCollectionTemplate : function()
		{
			html = 

				'<td><a id="<%= id %>" class="list-fancymedia" rel="group">'+
					//'<i class="jdicon-small-drag"></i><i class="jdicon-collection"></i> '+

					'<span class="jda-item-author"><%= author %></span></a>'+
				'</td>'+
				'<td class="jda-item-description">'+
					'<div class="jda-item-title"><%= title %></div>'+
					'<div><%= description %></div>'+
				'</td>'+
				'<td class="jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';

			
			return html;
		},
		getDefaultTemplate : function()
		{
			html = 
			

				'<td><a id="<%= id %>" class="list-fancymedia" rel="group">'+
					//'<i class="jdicon-small-drag"></i><i class="jdicon-document"></i> '+

					'<span class="jda-item-author"><%= author %></span></a>'+
				'</td>'+
				'<td class="jda-item-description"><%= title %><br/><%= description %></td>'+
				'<td class="jda-item-date"><%= media_date %><input class="jda-item-checkbox" type="checkbox"></td>';

			
			return html;
		}
		
	});
	
})(jda.module("browser"));