(function(Browser) {



	Browser.Modals = Browser.Modals || {};
	Browser.Modals.Views = Browser.Modals || {};
	
	Browser.Modals.Views.ArchiveSettings = Backbone.View.extend({
		
		events: {
			'click .close' : 'hide',
			'click .save' : 'save'
		},
		
		initialize: function()
		{
			
			this.settings = {
				'public' : this.model.get('published') ? 'checked' : '',
				'private' : !this.model.get('published') ? 'checked' : ''
			}
		},
		
		render: function()
		{
			$(this.el).html( _.template(this.getTemplate(),this.settings) );
			
			return this;
		},
		
		show : function()
		{
			this.$el.find('#modal-archive-settings').modal('show');
		},
		hide : function()
		{
			this.$el.find('#modal-archive-settings').modal('hide');
			this.remove();
			return false;
		},
		
		save : function()
		{
			var v = this.$el.find('input[name=set]:checked').val() == 'true' ? true : false;
			this.model.save({'published':v});
			if(v) $('.archive-setting-type').addClass('label-success').html('Public');
			else $('.archive-setting-type').removeClass('label-success').html('Limited');
			this.hide();
			return false;
		},
		
		getTemplate : function()
		{

			var html =
			
			'<div class="modal" id="modal-archive-settings">'+
				'<div class="modal-header">'+
					'<h3>Manage your collection\'s archive settings</h3>'+
				'</div>'+
				'<div class="modal-body">'+
				
					'<div class="control-group">'+
						'<label class="radio"><input name="set" type="radio" value="true" <%= public %>> <span class="label label-success">PUBLIC</span> Anyone can view your collection. Your collection will appear in general archive searches.</label>'+
						'<label class="radio"><input name="set" type="radio" value="false" <%= private %>> <span class="label">LIMITED</span> Only those people with a link to your collection can view it. Your collection will not appear in general archive searches or on your public user page.</label>'+
					'</div>'+
					'Note: it may take several minutes for the changes to take effect'+
				'</div>'+
				'<div class="modal-footer">'+
					'<a href="#" class="btn close">Cancel</a>'+
					'<a href="#" class="btn btn-success pull-right save">OK</a>'+
				'</div>'+
			'</div>';
			
			return html
		}
		

	});

})(jda.module("browser"));