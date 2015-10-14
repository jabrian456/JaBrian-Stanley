var
   router         = require('router'),
   userStore      = require('userStore'),
   propertyUtil   = require('PropertyUtil'),
   items          = require('/modules/items'),
   appData        = require('appData');

function renderIndex(req, res, todoItems, listType) {
   var data = {
      items: todoItems,
      itemFont: propertyUtil.getString(appData.get('itemFont'), 'selectorText'),
      appData: appData,
      listType: listType,
      remaining: items.getItemsCount(),
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
      res.sendError(400, 'Du måste skriva något..');
      return false;
   }

   if (todoItems.length >= appData.get('maxNumberOfItems')) {
      res.sendError(400, 'Du har redan fullt upp. Du måste lösa någon uppgift innan du kan lägga till nya..');
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
         count: items.getItemsCount()
      });
   } else {
      res.redirect('back');
   }
});

router.post('/delete/:item', function(req, res) {
   items.deleteItem(req.params.get('item'));
   res.redirect('back');
});

router['delete']('/delete/:item', function(req, res) {
   items.deleteItem(req.params.get('item'));
   return res.json({
      count: items.getItemsCount()
   });
});

router.post('/complete/:item', function(req, res) {
   items.completeItem(req.params.get('item'));
   res.redirect('back');
});

router.put('/complete/:item', function(req, res) {
   items.completeItem(req.params.get('item'));
   return res.json({
      count: items.getItemsCount()
   });
});
