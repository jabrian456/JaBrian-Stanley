define(function() {
   return {
      confirm: function(text) {
         return window.confirm(text);
      },
      alert: function(text) {
         window.alert(text);
      }
   };
});
