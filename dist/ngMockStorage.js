(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

(function (window, angular, undefined) {
  'use strict';

  StorageProvider.$inject = ['$windowProvider'];
  RouterProvider.$inject = ['$mockStorageProvider', '$httpProvider'];
  ModuleConfig.$inject = ['$provide', '$httpProvider'];

  /**
   * @ngdoc overview
   * @name ngMockStorage
   */

  return angular.module('ngMockStorage', [])

  /**
   * @ngdoc object
   * @name ngMockStorage.$mockStorage
   * @requires $window
   * @requires $log
   */

  .provider('$mockStorage', StorageProvider)

  /**
   * @ngdoc object
   * @name ngMockStorage.$mockRouter
   * @requires $log
   * @requires $q
   */

  .provider('$mockRouter', RouterProvider).config(ModuleConfig);

  function StorageProvider($windowProvider) {
    var provider = void 0,
        $window = $windowProvider.$get(),
        storageKeyPrefix = 'ngMockStorage-',
        storageType = 'localStorage',
        serializer = angular.toJson,
        deserializer = angular.fromJson;

    StorageService.$inject = ['$window', '$log'];

    provider = {
      setStorageType: setStorageType,
      setKeyPrefix: setKeyPrefix,
      setSerializer: setSerializer,
      setDeserializer: setDeserializer,
      setItem: setItem,
      clear: clear,
      $get: StorageService
    };

    return provider;

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

    function getItem(key) {
      return deserializer($window[storageType].getItem(storageKeyPrefix + key));
    }

    function setItem(key, value) {
      return $window[storageType].setItem(storageKeyPrefix + key, serializer(value));
    }

    function removeItem(key) {
      return $window[storageType].setItem(storageKeyPrefix + key);
    }

    function clear() {
      return $window[storageType].clear();
    }

    function StorageService($window, $log) {
      var service = void 0;

      if (isStorageSupported(storageType)) {
        service = {
          getItem: getItem,
          setItem: setItem,
          removeItem: removeItem,
          clear: clear
        };
      } else {
        $log.warn('This browser does not support Web Storage!');
        service = {
          setItem: angular.noop,
          getItem: angular.noop,
          removeItem: angular.noop,
          clear: angular.noop
        };
      }

      return service;

      function isStorageSupported() {

        // Some installations of IE, for an unknown reason, throw "SCRIPT5: Error: Access is denied"
        // when accessing window.localStorage. This happens before you try to do anything with it. Catch
        // that error and allow execution to continue.

        // fix 'SecurityError: DOM Exception 18' exception in Desktop Safari, Mobile Safari
        // when "Block cookies": "Always block" is turned on
        var supported = void 0,
            key = void 0;
        try {
          supported = $window[storageType];
        } catch (err) {
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
          } catch (err) {
            supported = false;
          }
        }

        return supported;
      }
    }
  }

  function RouterProvider($mockStorageProvider, $httpProvider) {
    var provider = void 0,
        namespace = '',
        logLevel = 0,
        availablesLogLevels = { error: 0, warn: 1, info: 2, debug: 3 },
        resources = [];

    RouterService.$inject = ['$log', '$q', '$mockStorage', '$injector'];

    provider = {
      setNamespace: setNamespace,
      setLogLevel: setLogLevel,
      addResource: addResource,
      loadDatas: loadDatas,
      $get: RouterService
    };

    return provider;

    function setNamespace(n) {
      if (typeof n !== 'string') {
        throw new TypeError('[ngMockRouter] - Provider.setNamespace expects a string.');
      }
      namespace = n;
    }

    function setLogLevel(l) {
      if (typeof l !== 'string') {
        throw new TypeError('[ngMockRouter] - Provider.setLogLevel expects a string (error|warning|info).');
      }
      if (Object.keys(availablesLogLevels).indexOf(l) > -1) {
        logLevel = availablesLogLevels[l];
      }
    }

    function addResource(n, o) {
      var config = void 0,
          resource = void 0,
          parentId = void 0;
      if (typeof n !== 'string') {
        throw new TypeError('[ngMockRouter] - Provider.addResource expects string, [object].');
      }

      if (o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) !== 'object') {
        throw new TypeError('[ngMockRouter] - Provider.addResource expects string, [object].');
      }

      if (n.indexOf('.') > -1) {
        var pos = n.lastIndexOf('.');
        parentId = n.substring(0, pos);
        n = n.substring(pos + 1);
      }

      config = Object.assign({
        primaryKey: 'id',
        collection: true,
        key: _getKey(n)
      }, o || {});

      config.parent = parentId;

      resource = _getResource(n);

      if (resource) {
        throw new TypeError('[ngMockRouter] - Provider.addResource: Resource ' + n + ' already exist.');
      } else {
        var newResource = {
          name: n
        };

        newResource.primaryKey = config.primaryKey;
        newResource.key = config.key;
        newResource.collection = config.collection;
        newResource.data = config.collection ? [] : {};

        if (config.parent) {
          var parent = _getResource(config.parent);
          if (parent) {
            if (newResource.collection && parent.keys.indexOf(newResource.key) > -1) {
              throw new TypeError('[ngMockRouter] - Provider.addResource: key ' + newResource.key + ' already exist. You can specify another one with the option key');
            }
            newResource.parent = config.parent;
          }
        }
        newResource.path = _getPath(newResource);
        newResource.id = _getId(newResource);
        newResource.keys = _getKeys(newResource);

        $mockStorageProvider.setItem(newResource.id, newResource.data);

        resources.push(newResource);
      }
    }

    function loadDatas(n, d) {
      var r = _getResource(n);

      if (r) {
        if (r.collection && Array.isArray(d)) {
          $mockStorageProvider.setItem(r.id, d);
        } else if (!r.collection && !Array.isArray(d) && (typeof d === 'undefined' ? 'undefined' : _typeof(d)) === 'object') {
          $mockStorageProvider.setItem(r.id, d);
        } else {
          throw new TypeError('[ngMockRouter] - Provider.loadDatas: Datas not valid.');
        }
      } else {
        throw new TypeError('[ngMockRouter] - Provider.loadDatas: Resource ' + n + ' do not exist.');
      }
    }

    function _getResource(n) {
      return resources.find(function (r) {
        return r.id === n;
      });
    }

    function _getKey(n) {
      return 'id' + n.charAt(0).toUpperCase() + n.substr(1).toLowerCase();
    }

    function _getPath(r) {
      var path = '';
      if (r.parent) {
        path += _getResource(r.parent).path + '/';
      }
      path += r.name + (r.collection ? '/:' + r.key : '');

      return path;
    }

    function _getId(r) {
      var id = '';
      if (r.parent) {
        id += _getResource(r.parent).id + '.';
      }
      id += r.name;

      return id;
    }

    function _getKeys(r) {
      var keys = [];
      if (r.parent && r.collection) {
        keys = [].concat(_toConsumableArray(_getResource(r.parent).keys), [r.key]);
      } else if (r.parent) {
        keys = _getResource(r.parent).keys;
      } else if (r.collection) {
        keys = [r.key];
      }
      return keys;
    }

    function RouterService($log, $q, $mockStorage, $injector) {
      var interceptors = $httpProvider.interceptors,
          reversedInterceptors = [],
          defaults = $httpProvider.defaults,
          service = {
        get: get(),
        post: post(),
        put: put(),
        delete: remove(),
        patch: patch(),
        getResource: getResource,
        interceptors: interceptors
      };

      interceptors.forEach(function (interceptorFactory) {
        reversedInterceptors.unshift(typeof interceptorFactory === 'string' ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
      });

      return service;

      function get() {
        return _createMethodWithoutData('get', function (d, r, p, rData, rIndex) {
          if (typeof rIndex !== 'undefined' && rIndex !== null) {
            rData = rData[rIndex];
          }
          _log('info', 'Response : ', 200, rData);
          d.resolve({
            status: 200,
            data: rData
          });
        });
      }

      function post() {
        return _createMethodWithData('post', function (d, r, p, data, rData) {
          var id = Math.random().toString(36).substring(2);
          if (Array.isArray(rData)) {
            data[r.primaryKey] = id;
            rData.push(data);
            $mockStorage.setItem(r.id, rData);
            _log('info', 'Response : ', 200, data);
            d.resolve({
              status: 200,
              data: data
            });
          } else {
            _log('info', 'Response : ', 405, { error: 'Method Not Allowed' });
            d.reject({
              status: 405,
              data: { error: 'Method Not Allowed' }
            });
          }
        });
      }

      function put() {
        return _createMethodWithData('put', function (d, r, p, data, rData, rIndex) {
          rData[rIndex] = data;
          $mockStorage.setItem(r.id, rData);
          _log('info', 'Response : ', 200, rData[rIndex]);
          d.resolve({
            status: 200,
            data: rData[rIndex]
          });
        });
      }

      function remove() {
        return _createMethodWithoutData('delete', function (d, r, p, rData, rIndex) {
          rData.splice(rIndex, 1);
          $mockStorage.setItem(r.id, rData);
          _log('info', 'Response : ', 200, rData);
          d.resolve({
            status: 200,
            data: rData
          });
        });
      }

      function patch() {
        return _createMethodWithData('patch', function (d, r, p, data, rData, rIndex) {
          Object.assign(rData[rIndex], data);
          $mockStorage.setItem(r.id, rData);
          _log('info', 'Response : ', 200, rData[rIndex]);
          d.resolve({
            status: 200,
            data: rData[rIndex]
          });
        });
      }

      function getResource(path) {
        path = ('/' + path + '/').replace(/\/\//g, '/');
        var r = resources.find(function (r) {
          return _getRegex(r.path).test(path);
        });
        if (r) {
          return [r, _getParams(path, r)];
        } else {
          return [null, null];
        }
      }

      function _getRegex(path) {
        path = '/' + namespace + '/' + path + '/';
        return new RegExp('^' + path.replace(/\/\//g, '/').replace(/\//g, '\\/').replace(/\:[\w]*/g, '(?:([^\\/]*))') + '?$');
      }

      function _getParams(path, r) {
        var i = void 0,
            params = {},
            m = path.match(_getRegex(r.path));

        for (i = 1; i < m.length; i++) {
          var key = r.keys[i - 1],
              val = _decodeParam(m[i]);

          if (val !== undefined || !hasOwnProperty.call(params, key)) {
            params[key] = val;
          }
        }
        return params;
      }

      function _decodeParam(val) {
        if (typeof val !== 'string' || val.length === 0) {
          return val;
        }

        try {
          return decodeURIComponent(val);
        } catch (err) {
          if (err instanceof URIError) {
            err.message = 'Failed to decode param \'' + val + '\'';
            err.status = err.statusCode = 400;
          }
          throw err;
        }
      }

      function _log(l) {
        if (Object.keys(availablesLogLevels).indexOf(l) > -1 && logLevel >= availablesLogLevels[l]) {
          for (var _len = arguments.length, msg = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            msg[_key - 1] = arguments[_key];
          }

          $log[l].apply($log, msg);
        }
      }

      function _parseHeaders(headers) {
        var parsed = {},
            i;

        function _fillInParsed(key, val) {
          if (key) {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }

        if (typeof headers === 'string') {
          headers.split('\n').forEach(function (line) {
            i = line.indexOf(':');
            _fillInParsed(line.substr(0, i).trim().toLowerCase(), line.substr(i + 1).trim());
          });
        } else if ((typeof headers === 'undefined' ? 'undefined' : _typeof(headers)) === 'object') {
          Object.keys(headers).forEach(function (headerKey) {
            _fillInParsed(headerKey.toLowerCase(), headers[headerKey].trim());
          });
        }

        return parsed;
      }

      function _headersGetter(headers) {
        var headersObj;

        return function (name) {
          if (!headersObj) {
            headersObj = _parseHeaders(headers);
          }

          if (name) {
            var value = headersObj[name.toLowerCase()];
            if (value === void 0) {
              value = null;
            }
            return value;
          }

          return headersObj;
        };
      }

      function _transformData(data, headers, status, fns) {
        if (typeof fns === 'function') {
          return fns(data, headers, status);
        } else if (fns) {
          var i = void 0;
          for (i = 0; i < fns.length; i++) {
            var fn = fns[i];
            data = fn(data, headers, status);
          }
        }
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        return data;
      }

      function _createMethodWithoutData(name, callback) {
        return function (url, config) {
          return _createMethod(name, url, null, config, function (d, r, p, config) {
            var resourceId = p[r.key],
                rData = $mockStorage.getItem(r.id);

            if (resourceId) {
              var rIndex = rData.findIndex(function (item) {
                return String(item[r.primaryKey]) === String(resourceId);
              });
              if (rIndex > -1) {
                callback(d, r, p, rData, rIndex);
              } else {
                _log('info', 'Response : ', 404, { error: 'Not Found' });
                d.reject({
                  status: 404,
                  data: { error: 'Not Found' }
                });
              }
            } else if (name === 'get') {
              callback(d, r, p, rData);
            } else {
              _log('info', 'Response : ', 404, { error: 'No Id Given' });
              d.reject({
                status: 404,
                data: { error: 'No Id Given' }
              });
            }
          });
        };
      }

      function _createMethodWithData(name, callback) {
        return function (url, data, config) {
          return _createMethod(name, url, data, config, function (d, r, p, config) {
            var resourceId = p[r.key],
                rData = $mockStorage.getItem(r.id);

            data = _transformData(data, _headersGetter(config.headers), undefined, config.transformRequest);

            if (resourceId) {
              var rIndex = rData.findIndex(function (item) {
                return String(item[r.primaryKey]) === String(resourceId);
              });
              if (rIndex > -1) {
                callback(d, r, p, data, rData, rIndex);
              } else {
                _log('info', 'Response : ', 404, { error: 'Not Found' });
                d.reject({
                  status: 404,
                  data: { error: 'Not Found' }
                });
              }
            } else if (name === 'post') {
              callback(d, r, p, data, rData);
            } else {
              _log('info', 'Response : ', 404, { error: 'No Id Given' });
              d.reject({
                status: 404,
                data: { error: 'No Id Given' }
              });
            }
          });
        };
      }

      function _createMethod(name, url, data, config, callback) {
        _log('info', name.toUpperCase() + ' : ', url);
        if (data) {
          _log('info', 'Data : ', data);
        }
        if (config) {
          _log('info', 'Config : ', config);
        }
        var d = $q.defer();
        var promise = d.promise;

        var _getResource2 = getResource(url);

        var _getResource3 = _slicedToArray(_getResource2, 2);

        var r = _getResource3[0];
        var p = _getResource3[1];

        config = Object.assign({
          transformRequest: defaults.transformRequest,
          transformResponse: defaults.transformResponse
        }, config);

        if (r) {
          callback(d, r, p, config);
        } else {
          _log('info', 'Response : ', 404, { error: 'Not a valid path!' });
          d.reject({
            status: 404,
            data: { error: 'Not a valid path!' }
          });
        }

        promise = promise.then(config.transformResponse, config.transformResponse);

        reversedInterceptors.forEach(function (interceptor) {
          if (interceptor.response || interceptor.responseError) {
            promise = promise.then(interceptor.response, interceptor.responseError);
          }
        });

        return promise;
      }
    }
  }

  function ModuleConfig($provide, $httpProvider) {
    httpDecorator.$inject = ['$delegate', '$mockRouter'];
    $provide.decorator('$http', httpDecorator);

    function httpDecorator($delegate, $mockRouter) {
      var wrapper = function wrapper() {
        return $delegate.apply($delegate, arguments);
      };

      $mockRouter.interceptors = $httpProvider.interceptors;
      $mockRouter.defaults = $httpProvider.defaults;

      Object.keys($delegate).filter(function (k) {
        return typeof $delegate[k] !== 'function';
      }).forEach(function (k) {
        wrapper[k] = $delegate[k];
      });

      Object.keys($delegate).filter(function (k) {
        return typeof $delegate[k] === 'function';
      }).forEach(function (k) {
        wrapper[k] = function () {
          if (typeof $mockRouter[k] === 'function') {
            return $mockRouter[k].apply($mockRouter, arguments);
          } else {
            return $delegate[k].apply($delegate, arguments);
          }
        };
      });

      return wrapper;
    }
  }
})(window, window.angular);

},{}]},{},[1])

