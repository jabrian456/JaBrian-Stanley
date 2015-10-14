var userStore = require('userStore');

function getItems() {
   return userStore.items ? userStore.items.split('|') : [];
}

function getCompletedItems() {
   return userStore.completedItems ? userStore.completedItems.split('|') : [];
}

function setCompletedItems(items) {
   userStore.completedItems = items.join('|');
}

function setItems(items) {
   userStore.items = items.join('|');
}

exports.getItems = function() {
   return getItems().map(function(item) {
      return {
         name: item,
         done: false
      };
   });
};

exports.getCompletedItems = function() {
   return getCompletedItems().map(function(item) {
      return {
         name: item,
         done: true
      };
   });
};

exports.getAllItems = function() {
   return this.getCompletedItems().concat(this.getItems());
};

exports.addItem = function(item) {
   var items = getItems();
   items.push(item);
   setItems(items);
};

exports.completeItem = function(item) {
   var completedItems = getCompletedItems();
   completedItems.push(item);
   setCompletedItems(completedItems);

   function filterFunction(foundItem) {
      return item !== foundItem;
   }

   setItems(getItems().filter(filterFunction));
};

exports.deleteItem = function(itemToDelete) {
   var items = getItems(),
      completedItems = getCompletedItems();

   function filterFunction(item) {
      return item !== itemToDelete;
   }

   setItems(items.filter(filterFunction));
   setCompletedItems(completedItems.filter(filterFunction));
};
