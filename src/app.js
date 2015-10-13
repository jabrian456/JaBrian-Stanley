var
   router         = require('router'),
   userStore      = require('userStore'),
   propertyUtil   = require('PropertyUtil'),
   appData        = require('appData');

router.get('/',  function(req, res) {
   res.render('index', {
      items: userStore.items ? userStore.items.split('|') : [],
      headingFont: propertyUtil.getString(appData.get('headingFont'), 'selectorText'),
      itemFont: propertyUtil.getString(appData.get('itemFont'), 'selectorText'),
      appData: appData
   });
});

function toManyItems(items) {
   return items.length >= appData.get('maxNumberOfItems');
}

function handleAdd(todoItem, items, res) {
   if (!todoItem || toManyItems(items)) {
      res.redirect(400, '/');
      return false;
   }

   res.redirect('/');
   return true;
}

function handleAjaxAdd(todoItem, items, res) {
   if (!todoItem) {
      res.setStatus(400);
      res.json({
         message: 'You cannot add empty items'
      });
      return false;
   }

   if (toManyItems(items)) {
      res.setStatus(400);
      res.json({
         message: 'You cannot add more TODOs before you actually do something'
      });
      return false;
   }

   res.json({
      item: todoItem,
      itemFont: propertyUtil.getString(appData.get('itemFont'), 'selectorText')
   });
   return true;
}

router.post('/add', function(req, res) {
   var todoItem = req.params.get('todoItem'),
      items = userStore.items ? userStore.items.split('|') : [],
      result = false;

   result = req.isAjax() ? handleAjaxAdd(todoItem, items, res) :
      handleAdd(todoItem, items, res);

   if (result) {
      items.push(todoItem);
      userStore.items = items.join('|');
   }
});

function handleDelete(req) {
   var items = userStore.items.split('|');
   userStore.items = items.filter(function(item) {
      return item !== req.params.get('item');
   }).join('|');
}

router.post('/delete/:item', function(req, res) {
   handleDelete(req);
   res.redirect('/');
});

router['delete']('/delete/:item', function(req, res) {
   handleDelete(req);
   res.json({
      success: true
   });
});
