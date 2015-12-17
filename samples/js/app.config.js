(function() {
  'use strict';

  angular.module('todomvc')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider'];

  function configFn($mockRouterProvider) {
    $mockRouterProvider.setNamespace('api');
    $mockRouterProvider.addResource('todos');
  }
})();