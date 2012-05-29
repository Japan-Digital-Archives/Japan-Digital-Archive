(function(Items) {

	Items.Model = Backbone.Model.extend({

		type:'item',

		defaults : {
			'media_creator_realname' : 'unknown',
			'media_creator_username' : 'unknown',
		},
		initialize : function()
		{
			
			var Tags = jda.module("tags");
			this.tags=new Tags.Collection();
		},

		loadTags : function(successFunction, errorFunction)
		{
			this.tags.reset({silent:true});
			this.tags.item_id=this.id;
			this.tags.fetch({ 
				success:successFunction,
				error:errorFunction,
			});
		},
		parse : function(response)
		{
			if (response.items)
				return response.items[0];
			else 
				return response;
		},
		
	});

})(jda.module("items"));
