(function(Browser) {
  
    Browser.Items = Browser.Items || {};
    Browser.Items.Views = Browser.Items || {};

    Browser.Items.Views.WakuArea = Backbone.View.extend({

        el : $('#jda-collection-waku-area'),

        events: {
            'click #jda-collection-create-waku' : 'createWakuFromCollection'
        },

        initialize: function()
        {
            this.render();
        },

        render: function() 
        {
            var _this = this;
        },

        createWakuFromCollection: function() 
        {
            var WAKU_SOURCE_URL = "http://jdawaku.herokuapp.com/#en/dashboard/";
            var collectionId    = this.model.id;
            var url             = WAKU_SOURCE_URL + collectionId;

            window.open(url, '_blank');
        }

      });

})(jda.module("browser"));
