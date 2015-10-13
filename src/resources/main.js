define(function(require) {

   var item = require('/templates/item'),
      App = require('app'),
      server = require('server'),
      $ = require('jquery'),
      confirm = require('/confirm');

   return App.extend({

      events: {
         'submit .todo-form'        : 'handleFormSubmit',
         'submit .todo-delete-form' : 'handleDelete'
      },

      handleDelete: function(e) {
         var $currentTarget = $(e.currentTarget);

         e.preventDefault();

         if (confirm('Are you sure?')) {
            server.doDelete({
               url: $currentTarget.attr('action')
            }).done(function(response) {
               $currentTarget.closest('li').remove();
            });
         }
      },

      handleFormSubmit: function(e) {
         var $currentTarget = $(e.currentTarget),
            $todoField = $currentTarget.find('[name=todoItem]'),
            $todoList = this.$('.todo-list'),
            todoItem = $todoField.val();

         e.preventDefault();

         if (!todoItem) {
            alert('Invalid item');
            return;
         }

         if ($.inArray(todoItem, $todoList.find('.item-name').map(function() {return this.innerText;})) !== -1) {
            alert('Item already in list');
            return;
         }

         server.doPost({
            url: $currentTarget.attr('action'),
            data: {
               todoItem: todoItem
            },
            context: this
         }).done(function(response) {
            $todoList.append(this.renderTemplate(item, response));
            $todoField.val('');
         }).fail(function(response) {
            var error = JSON.parse(response.responseText);
            alert(error.message);
         });
      }
   });
});
