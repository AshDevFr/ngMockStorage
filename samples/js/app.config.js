(function() {
  'use strict';

  angular.module('todomvc')
    .config(configFn);

  configFn.$inject = ['$mockStorageProvider', '$mockRouterProvider', '$httpProvider'];

  function configFn($mockStorageProvider, $mockRouterProvider, $httpProvider) {
    $mockRouterProvider.setNamespace('api');
    //$mockRouterProvider.setRouteMode('advanced');
    $mockRouterProvider.setLogLevel('debug');
    $mockRouterProvider.addResource('todos');
    $mockRouterProvider.addResource('todos.infos', {collection : false});

    $mockRouterProvider.loadDatas('todos', [
      {
        id : 1,
        title : 'Todos 1',
        isDone : false
      },
      {
        id : 2,
        title : 'Todos 2',
        isDone : false
      }
    ]);

    $httpProvider.interceptors.push('errInterceptorService');
    $httpProvider.defaults.transformRequest.push(function(data) {
      if (data) {
        data = JSON.parse(data);
        data.truc = true;
      }

      return data;
    });
  }
})();
