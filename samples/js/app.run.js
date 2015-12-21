(function() {
  'use strict';

  angular.module('todomvc')
    .run(runFn);

  runFn.$inject = ['$http'];

  function runFn($http) {
    $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w';
  }
})();