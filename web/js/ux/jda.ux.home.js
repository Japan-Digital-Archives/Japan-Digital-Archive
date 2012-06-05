
$(document).ready(function(){

	$('#home-search-bar').focus();
	$('#home-search-bar').find('input').bind('keypress', function(e) {
        if(e.keyCode==13){
            var query = $('#home-search-text-field').val();
			window.location = 'search#q=' + query;
			return false;
        }
	});
	$('#go-button').click(function(){
		var query = $('#home-search-text-field').val();
		window.location = 'search#q=' + query;
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