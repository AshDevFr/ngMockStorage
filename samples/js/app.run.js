(function() {
  'use strict';

  angular.module('ngMSApp')
    .run(runFn);

  runFn.$inject = ['$mockRouter', '$http'];

  function runFn($mockRouter, $http) {
    //console.log($mockRouter.getResource('test/23452345/test2'));

    $http.get('test/23452345/test3/YTR/test4').then(function(response) {
      console.log('success', response);
    }, function(error) {
      console.error('error', error);
    });

    $http.post('test/23452345/test3/YTR/test4', {title : 'Todo1', isDone : false}).then(function(response) {
      console.log('success', response);
    }, function(error) {
      console.error('error', error);
    });

    $http.get('test/23452345/test3/YTR/test4').then(function(response) {
      console.log('success', response);
    }, function(error) {
      console.error('error', error);
    });

    $http.get('test/23452345/test3/YTR/test4/1').then(function(response) {
      console.log('success', response);
    }, function(error) {
      console.error('error', error);
    });

    $http.get('test/23452345/test3/YTR/test4/2').then(function(response) {
      console.log('success', response);
    }, function(error) {
      console.error('error', error);
    });
  }
})();