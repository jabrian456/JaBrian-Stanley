define(function(require) {

   var itemTemplate = require('/templates/item'),
      todoListTemplate = require('/templates/todo-list'),
      todoCountTemplate = require('/templates/todo-count'),
      App = require('app'),
      server = require('server'),
      $ = require('jquery'),
      _ = require('underscore'),
      message = require('/message');

   return App.extend({

      events: {
         'submit .todo-form'        : 'handleAdd',
         'submit .todo-delete-form' : 'handleDelete',
         'submit .todo-done-form'   : 'handleDone',
         'click .filters a'         : 'filterSelection'
      },

      onInit: function() {
         this.$el.addClass('js');
         this.$todoCount = this.$('.todo-count');
      },

      updateTodoCount: function(data) {
         this.$todoCount.html(this.renderTemplate(todoCountTemplate, data));
      },

      handleDone: function(e) {
         var $currentTarget = $(e.currentTarget);

         e.preventDefault();
         server.doPut({
            url: $currentTarget.attr('action'),
            context: this
         }).done(function(response) {
            var $closestLi = $currentTarget.closest('li');
            if ($currentTarget.closest('.todo-list').hasClass('all')) {
               $closestLi.addClass('done');
            } else {
               $closestLi.remove();
            }
            this.updateTodoCount(response);
         });
      },

      handleDelete: function(e) {
         var $currentTarget = $(e.currentTarget);

         e.preventDefault();

         if (message.confirm('Är du säker?')) {
            server.doDelete({
               url: $currentTarget.attr('action'),
               context: this
            }).done(function(response) {
               $currentTarget.closest('li').remove();
               this.updateTodoCount(response);
            });
         }
      },

      handleAdd: function(e) {
         var $currentTarget = $(e.currentTarget),
            $todoField = $currentTarget.find('[name=todoItem]'),
            $todoList = this.$('.todo-list'),
            todoItem = $todoField.val();

         e.preventDefault();

         if (!todoItem) {
            message.alert('Felaktig inmatning');
            return;
         }

         if ($.inArray(todoItem, $todoList.find('.item-name').map(function() {return this.innerText;})) !== -1) {
            message.alert('Finns redan en sådan uppgift..');
            return;
         }

         server.doPost({
            url: $currentTarget.attr('action'),
            data: {
               todoItem: todoItem
            },
            context: this
         }).done(function(response) {
            if ($todoList.hasClass('all') || $todoList.hasClass('remaining')) {
               $todoList.append(this.renderTemplate(itemTemplate, response));
            }
            this.updateTodoCount(response);
            $todoField.val('');
         }).fail(function(response) {
            var error = JSON.parse(response.responseText);
            message.alert(error.message);
         });
      },

      filterSelection: function(e) {
         var $currentTarget = $(e.currentTarget);
         e.preventDefault();
         server.doGet({
            url: $currentTarget.attr('href'),
            context: this
         }).done(function(response) {
            response.items = _.toArray(response.items);
            this.$('.filters a').removeClass('selected');
            $currentTarget.addClass('selected');
            this.$('.main').html(this.renderTemplate(todoListTemplate, response));
         });
      }
   });
});
