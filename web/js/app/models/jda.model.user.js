(function(Browser) {
	
	Browser.Users= Browser.Users || {};
	Browser.Users.Model = Backbone.Model.extend({

		type:'user',

		defaults : {
			
		},
		initialize : function()
		{
			var test = "hi";
			
		},
		url : function(){
			var url = jda.app.apiLocation + 'api/users/' + this.id;
			console.log("Final url for getting user is: " + url);
			return url;
		}
	});

})(jda.module("browser"));
