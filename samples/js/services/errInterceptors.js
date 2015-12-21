(function() {
  'use strict';

  angular.module('todomvc')
    .factory('errInterceptorService', errInterceptorService);

  errInterceptorService.$inject = ['$rootScope', '$q', '$log'];

  function errInterceptorService($rootScope, $q, $log) {
    return {
      request       : function(config) {
        $log.info('Request', config);

        return config;
      },
      requestError  : function(rejection) {
        $log.info('RequestError', rejection);

        return $q.reject(rejection);
      },
      response      : function(response) {
        $log.info('Response', response.status + ' responded');

        $rootScope.$emit('event:errEvent', response);
        return response;
      },
      responseError : function(rejection) {
        $log.error('responseError', rejection.status + ' responded');

        $rootScope.$emit('event:errEvent', rejection);
        return $q.reject(rejection);
      }
    };
  }
})();
