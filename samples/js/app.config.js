(function() {
  'use strict';

  angular.module('ngMSApp')
    .config(configFn);

  configFn.$inject = ['$mockStorageProvider', '$mockRouterProvider'];

  function configFn($mockStorageProvider, $mockRouterProvider) {
    $mockRouterProvider.addResource('test');
    $mockRouterProvider.addResource('test2', {parent : 'test', collection : false});
    $mockRouterProvider.addResource('test3', {parent : 'test', primaryKey : '_id'});
    $mockRouterProvider.addResource('test4', {parent : 'test3'});
  }
})();