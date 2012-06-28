(function(Browser) {
	Browser.Items = Browser.Items||{};
	
	Browser.Items.Model = Backbone.Model.extend({

		type:'item',

		defaults : {
			'published' : false,
            'attribution_uri': 'default',
            'uri': 'default',
            'archive': 'default',
            'media_type': 'Collection',
            'layer_type': 'Collection'
		},
		initialize : function()
		{
			this.tags=new Browser.Tags.Collection();
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
		url : function(){ 
			
			if(_.isUndefined(this.id)) var url = jda.app.apiLocation + 'api/items';
			else var url = jda.app.apiLocation + 'api/items/' + this.id;
			return url;
		},
	});

})(jda.module("browser"));
