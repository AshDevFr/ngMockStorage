(function() {
  'use strict';

  angular.module('todomvc')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider', '$httpProvider'];

  function configFn($mockRouterProvider, $httpProvider) {
    $mockRouterProvider.setNamespace('api');
    $mockRouterProvider.setLogLevel('info');
    $mockRouterProvider.addResource('todos');


    $httpProvider.interceptors.push('errInterceptorService');
    $httpProvider.defaults.transformRequest.push(function(response) {
      var data  = JSON.parse(response);
      data.truc = true;

      return data;
    });
  }
})();