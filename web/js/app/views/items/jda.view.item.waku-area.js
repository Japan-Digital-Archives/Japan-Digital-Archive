(function(Browser) {
  
  Browser.Items = Browser.Items || {};
  Broswer.Items.Views = Browser.Items || {};

  Browser.Items.Views.WakuArea = Backbone.View.extend({

    el : $('#jda-collection-waku-area'),

    events: {
      'click create-waku-from-collection' : 'createWakuFromCollection'
    },

    initialize: function ()
    {
      console.log("Creating Waku Area");
    },

    render: function() 
    {
      var _this = this;
      console.log(this.model);
    },

    createWakuFromCollection: function() 
    {
      console.log("Clicked createWakuFromCollection button");
    }

  });

})(jda.module("browser"));
