var
   router         = require('router'),
   userStore      = require('userStore'),
   propertyUtil   = require('PropertyUtil'),
   items          = require('/modules/items'),
   appData        = require('appData');

function renderIndex(req, res, items, listType) {
   var data = {
      items: items,
      headingFont: propertyUtil.getString(appData.get('headingFont'), 'selectorText'),
      itemFont: propertyUtil.getString(appData.get('itemFont'), 'selectorText'),
      appData: appData,
      listType: listType,
      error: req.hasError() ? { status: req.getErrorStatus(), message: req.getErrorMessage() } : undefined
   };

   if (req.isAjax()) {
      return res.json(data);
   }

   return res.render('index', data);
}

router.get('/',  function(req, res) {
   return renderIndex(req, res, items.getItems(), 'remaining');
});

router.get('/completed',  function(req, res) {
   return renderIndex(req, res, items.getCompletedItems(), 'completed');
});

router.get('/all',  function(req, res) {
   return renderIndex(req, res, items.getAllItems(), 'all');
});

router.post('/add', function(req, res) {
   var todoItem = req.params.get('todoItem'),
      todoItems = items.getItems(),
      result = false;

   if (!todoItem) {
      res.sendError(400, 'You cannot add empty items');
      return false;
   }

   if (todoItems.length >= appData.get('maxNumberOfItems')) {
      res.sendError(400, 'You cannot add more TODOs before you actually do something');
      return false;
   }

   items.addItem(todoItem);

   if (req.isAjax()) {
      res.json({
         item: {
            name: todoItem,
            done: false
         },
         itemFont: propertyUtil.getString(appData.get('itemFont'), 'selectorText'),
         count: todoItems.length
      });
   } else {
      res.redirect('/');
   }
});

router.post('/delete/:item', function(req, res) {
   items.deleteItem(req.params.get('item'));
   res.redirect('/');
});

router['delete']('/delete/:item', function(req, res) {
   items.deleteItem(req.params.get('item'));
   return res.json({
      count: items.getItems().length
   });
});

router.post('/complete/:item', function(req, res) {
   items.completeItem(req.params.get('item'));
   res.redirect('/');
});

router.put('/complete/:item', function(req, res) {
   items.completeItem(req.params.get('item'));
   return res.json({
      count: items.getItems().length
   });
});
