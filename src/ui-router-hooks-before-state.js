(function() {
  'use strict';
  var hookBeforeState = angular.module('ui.router.hooks.beforeState', ['ui.router']);

  function isInjectable(obj) {
    return angular.isFunction(obj) ||
      angular.isArray(obj) && angular.isString(obj[0]);
  }

  function processFilter($injector, $state, event, to, filter) {
    var result = $injector.invoke(filter);

    if (result) {
      if(result.to) {
        // Discontinue chain if redirection occurs
        event.preventDefault();

        $state.go(result.to, result.params, result.options);

        return false;
      } else if(result.params) {
        angular.extend($state.params, result.params);
      }
    }
    return result;
  }

  hookBeforeState.run([
    '$rootScope',
    '$state',
    '$injector',
    function($rootScope, $state, $injector) {
      $rootScope.$on('$stateChangeStart', function(event, to) {
        var filters, result;
        if (!(filters = to.data.beforeState)) { return; }

        if(isInjectable(filters)) {
          processFilter($injector, $state, event, to, filters);
        } else {
          for(var i = 0; i < filters.length; i++) {
            result = processFilter($injector, $state, event, to, filters[i]);
            if(result === false) { return; }
          }
        }
      });
    }
  ]);
})();
