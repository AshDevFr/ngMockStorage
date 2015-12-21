(function() {
  'use strict';

  angular.module('todomvc')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider', '$httpProvider'];

  function configFn($mockRouterProvider, $httpProvider) {
    $mockRouterProvider.setNamespace('api');
    $mockRouterProvider.setLogLevel('info');
    $mockRouterProvider.addResource('todos');
    $mockRouterProvider.addResource('todos.infos', {collection : false});

    $mockRouterProvider.loadDatas('todos', [
      {
        id     : 1,
        title  : 'Todos 1',
        isDone : false
      },
      {
        id     : 2,
        title  : 'Todos 2',
        isDone : false
      }
    ]);

    $httpProvider.interceptors.push('errInterceptorService');
    $httpProvider.defaults.transformRequest.push(function(response) {
      var data  = JSON.parse(response);
      data.truc = true;

      return data;
    });
  }
})();