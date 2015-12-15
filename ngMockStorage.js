(function(root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else if (root.hasOwnProperty('angular')) {
    // Browser globals (root is window), we don't register it.
    factory(root.angular);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('angular'));
  }
}(this, function(angular) {
  'use strict';

  // In cases where Angular does not get passed or angular is a truthy value
  // but misses .module we can fall back to using window.
  angular = (angular && angular.module) ? angular : window.angular;

  /**
   * @ngdoc overview
   * @name ngMockStorage
   */

  return angular.module('ngMockStorage', [])

    /**
     * @ngdoc object
     * @name ngMockStorage.$localStorage
     * @requires $log
     */

    .provider('$mockStorage', _storageProvider())
    .provider('$routerStorage', _routerProvider());

  function _storageProvider() {
    return function() {
      var storageKeyPrefix = 'ngMockStorage-',
          storageType      = 'localStorage',
          serializer       = angular.toJson,
          deserializer     = angular.fromJson;

      this.setStorageType  = setStorageType;
      this.setKeyPrefix    = setKeyPrefix;
      this.setSerializer   = setSerializer;
      this.setDeserializer = setDeserializer;

      storageService.$inject = ['$log'];
      this.$get              = storageService;


      function setStorageType(type) {
        if (typeof type !== 'string') {
          throw new TypeError('[ngMockStorage] - Provider.setStorageType() expects a String.');
        }
        storageType = type;
      }

      function setKeyPrefix(prefix) {
        if (typeof prefix !== 'string') {
          throw new TypeError('[ngMockStorage] - Provider.setKeyPrefix() expects a String.');
        }
        storageKeyPrefix = prefix;
      }

      function setSerializer(s) {
        if (typeof s !== 'function') {
          throw new TypeError('[ngMockStorage] - Provider.setSerializer expects a function.');
        }
        serializer = s;
      }

      function setDeserializer(d) {
        if (typeof d !== 'function') {
          throw new TypeError('[ngMockStorage] - Provider.setDeserializer expects a function.');
        }
        deserializer = d;
      }

      function storageService($log) {

        var service;

        // #9: Assign a placeholder object if Web Storage is unavailable to prevent breaking the entire AngularJS app
        if (isStorageSupported(storageType)) {
          service = {
            getItem    : getItem,
            setItem    : setItem,
            removeItem : removeItem,
            clear      : clear
          };
        } else {
          $log.warn('This browser does not support Web Storage!');
          service = {
            setItem    : angular.noop,
            getItem    : angular.noop,
            removeItem : angular.noop,
            clear      : angular.noop
          };
        }

        return service;

        function isStorageSupported() {

          // Some installations of IE, for an unknown reason, throw "SCRIPT5: Error: Access is denied"
          // when accessing window.localStorage. This happens before you try to do anything with it. Catch
          // that error and allow execution to continue.

          // fix 'SecurityError: DOM Exception 18' exception in Desktop Safari, Mobile Safari
          // when "Block cookies": "Always block" is turned on
          var supported, key;
          try {
            supported = $window[storageType];
          }
          catch (err) {
            supported = false;
          }

          // When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
          // is available, but trying to call .setItem throws an exception below:
          // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
          if (supported && storageType === 'localStorage') {
            key = '__' + Math.round(Math.random() * 1e7);

            try {
              localStorage.setItem(key, key);
              localStorage.removeItem(key);
            }
            catch (err) {
              supported = false;
            }
          }

          return supported;
        }

        function getItem(key) {
          return deserializer(window[storageType].getItem(storageKeyPrefix + key));
        }

        function setItem(key, value) {
          return window[storageType].setItem(storageKeyPrefix + key, serializer(value));
        }

        function removeItem(key) {
          return window[storageType].setItem(storageKeyPrefix + key);
        }

        function clear() {
          return window[storageType].clear();
        }
      }
    };
  }

  function _routerProvider() {

  }
}));
