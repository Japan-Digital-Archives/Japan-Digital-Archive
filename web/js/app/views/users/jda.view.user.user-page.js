(function(Users) {

	//This is for the description/title info of a collection that shows up at the top of the page
	Users.Views.UserPage = Backbone.View.extend({
		
		el : $('#jda-user-filter'),
		
		

		events: {
			

		},
		initialize: function () {



		},
		render: function(done)
		{
			var _this = this;

			var facetExists = false;

			$('.jda-separate-collections-and-items').show();
			//first remove other user filters
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				if (facet.model.get("category")=="user" && facet.model.get("value") != _this.model.get('display_name')) {
					facet.model.set({'value': null });
					facet.remove();
				} else if (facet.model.get("category")=="user" && facet.model.get("value") == _this.model.get('display_name')){
					facetExists = true;
				}
			});
			
			//add user filter to the VisualSearch box
			if (!facetExists){	
				VisualSearch.searchBox.addFacet('user', this.model.get('display_name'), 0);
			}
			
			//user filter close removes the filter from the DOM and sets the object to null
			_.each( VisualSearch.searchBox.facetViews, function( facet ){
				
				if (facet.model.get("category")=="user") {
					$(facet.el).find('.VS-icon-cancel').click(function(){
						jda.app.removeFilter('user');

					});
				}
			});

			/***************************************************************************
			Put template together
			***************************************************************************/
			var template = this.getTemplate();
			var blanks = this.model.attributes;

			$(this.el).html( _.template( template, blanks ) );

			$(this.el).find('.jda-user-filter-edit-profile-image').click(function(){
				alert('Edits profile image for user');
				return false;
			});

			return this;
		},
		remove:function(){

			//remove from DOM
			$(this.el).empty();
			$('.jda-separate-collections-and-items').hide();

		},
		
		getTemplate : function()
		{
			html = 
			

			
			'<div class="span4">'+
			'<img class="pull-left" src="<%=thumbnail_url%>" alt="" style="width:160px;height:120px;margin-right:10px;border: 1px solid grey;">'+
			'<a href="#" class="jda-user-filter-edit-profile-image"><i class="icon-cog icon-white" style="left: 142px;top: 5px;position: absolute;"></i></a>'+
			'<h3 class="jda-user-filter-name"><%=display_name%></h3>'+
			'<p><strong>Tokyo, Japan</strong></p>'+
			'<i class="jdicon-small-facebook"></i> <i class="jdicon-small-tweet"></i>'+


			'</div>'+
			'<div class="span6">'+

			'<span class="jda-user-filter-description"><%=bio%></span><i class="icon-plus-sign" style="display:none"></i>'+
			


			'</div>'+
			'<div class="span2">'+

			'&nbsp;'+

			'</div>';

			
			return html;
		},
		

	});

})(jda.module("users"));