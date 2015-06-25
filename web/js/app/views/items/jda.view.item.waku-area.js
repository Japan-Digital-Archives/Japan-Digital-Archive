(function(Browser) {
  
    Browser.Items = Browser.Items || {};
    Browser.Items.Views = Browser.Items || {};

    Browser.Items.Views.WakuArea = Backbone.View.extend({

        el : $('#jda-collection-waku-area'),

        events: {
            'click #jda-collection-create-waku' : 'createWakuFromCollection',
	    'click #jda-collection-close-informational'   : 'hideInformational'
        },

        initialize: function()
        {
	    this.informational = window.localStorage.getItem("jda-collection-view-informational") || false;
            this.render();
        },

        render: function() 
        {
            var _this = this;
	    if (this.informational === "show" || this.informational === false){
		this.showInformational();
	    }
	    this.showButton(); // Because it should render alongside the collection list
        },

	showButton: function()
	{
	    $('#jda-collection-create-waku').fadeIn();
	},

        createWakuFromCollection: function() 
        {
            var WAKU_SOURCE_URL = "http://jdawaku.herokuapp.com/#en/dashboard/";
            var collectionId    = this.model.id;
            var url             = WAKU_SOURCE_URL + collectionId;

            window.open(url, '_blank');
        },

	showInformational: function()
	{
	    $('#jda-collection-informational').fadeIn();
	    window.localStorage.setItem("jda-collection-view-informational", "show");
	},

	hideInformational: function()
	{
	    $('#jda-collection-informational').fadeOut();
	    window.localStorage.setItem("jda-collection-view-informational", "hide");
	}

      });

})(jda.module("browser"));
