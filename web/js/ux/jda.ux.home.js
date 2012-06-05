
$(document).ready(function(){

	$('.jda-home-featured-collection').height(Math.max($(window).height()-50, 600));
	$(window).resize(function() {
      $('.jda-home-featured-collection').height(Math.max($(window).height()-50, 600));
  });
	// Shorthand the application namespace
	//http://documentcloud.github.com/visualsearch/
	VisualSearch = VS.init({
		container : $('.visual_search'),
		query     : '',
		callbacks : {
			
			loaded	: function(){ 
				$('.VS-search-box').css('width','450px');
				
				$("#jda-home-search-div, #search-bar").fadeTo('slow',1); 
				$('input').attr('placeholder', 'Explore the Archive');
				$('input').css('width', '200px');
				$('input').css('padding-top', '9px');
				$('input').focus(function(){
					$(this).attr('placeholder', '');
					$(this).css('width', '3px');
				});

				$('#jda-go-button').click(function(){
					var query = VisualSearch.searchBox.value();
					window.location = 'search#q=' + query;
				});
			},

			search : function(){ 
				var query = VisualSearch.searchBox.value();
				window.location = 'search#q=' + query;
				

			},

			clearSearch : function(){ $('input').val('');},
			// These are the facets that will be autocompleted in an empty input.
			facetMatches : function(callback)
			{
				callback([
					'tag', 'keyword', 'text', 'data:time & place','collection','user'
				]);
			},
			// These are the values that match specific categories, autocompleted
			// in a category's input field.  searchTerm can be used to filter the
			// list on the server-side, prior to providing a list to the widget.
			valueMatches : function(facet, searchTerm, callback)
			{
				switch (facet)
				{
				
					case 'tag':
						callback([]);
						break;
					case 'keyword':
						callback([]);
						break;
					case 'text':
						callback([]);
						break;
					case 'data:time & place':
						callback([]);
						break;
				}
			}
		} //callbacks
	});

	
	$('#jda-language-toggle').find('.btn').click(function(){
		if(!$(this).hasClass('active')){
			$('#jda-language-toggle').find('.btn').removeClass('active');
			$(this).addClass('active');
			if($(this).data('language')=='en') window.location =  window.location.href.replace('ja/search','en/search');
			else window.location =  window.location.href.replace('en/search','ja/search');
		}
	});

});