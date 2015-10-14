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
      appData: appData,
      error: req.hasError() ? { status: req.getErrorStatus(), message: req.getErrorMessage() } : undefined
   });
});

function toManyItems(items) {
   return items.length >= appData.get('maxNumberOfItems');
}

router.post('/add', function(req, res) {
   var todoItem = req.params.get('todoItem'),
      items = userStore.items ? userStore.items.split('|') : [],
      result = false;

   if (!todoItem) {
      res.sendError(400, 'You cannot add empty items')
      return false;
   }

   if (toManyItems(items)) {
      res.sendError(400, 'You cannot add more TODOs before you actually do something');
      return false;
   }

   items.push(todoItem);
   userStore.items = items.join('|');

   if (req.isAjax()) {
      res.json({
         item: todoItem,
         itemFont: propertyUtil.getString(appData.get('itemFont'), 'selectorText')
      });
   } else {
      res.redirect('/');
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
