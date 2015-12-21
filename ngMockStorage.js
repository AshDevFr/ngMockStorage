(function(window, angular, undefined) {
  'use strict';

  StorageProvider.$inject = ['$windowProvider'];
  RouterProvider.$inject  = ['$mockStorageProvider'];

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

    .provider('$mockRouter', RouterProvider)

    .config(['$provide', ModuleConfig]);


  function StorageProvider($windowProvider) {
    let provider,
        $window          = $windowProvider.$get(),
        storageKeyPrefix = 'ngMockStorage-',
        storageType      = 'localStorage',
        serializer       = angular.toJson,
        deserializer     = angular.fromJson;

    StorageService.$inject = ['$window', '$log'];

    provider = {
      setStorageType  : setStorageType,
      setKeyPrefix    : setKeyPrefix,
      setSerializer   : setSerializer,
      setDeserializer : setDeserializer,
      setItem         : setItem,
      clear           : clear,
      $get            : StorageService
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
      let service;

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
        let supported, key;
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
    }
  }

  function RouterProvider($mockStorageProvider) {
    let provider,
        namespace           = '',
        logLevel            = 0,
        availablesLogLevels = {error : 0, warn : 1, info : 2, debug : 3},
        resources           = [],
        defaults            = {};

    RouterService.$inject = ['$log', '$q', '$mockStorage'];

    provider = {
      setNamespace : setNamespace,
      setLogLevel  : setLogLevel,
      addResource  : addResource,
      defaults     : defaults,
      $get         : RouterService
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
      let config, resource;
      if (typeof n !== 'string') {
        throw new TypeError('[ngMockRouter] - Provider.addResource expects string, [object].');
      }

      if (o && typeof o !== 'object') {
        throw new TypeError('[ngMockRouter] - Provider.addResource expects string, [object].');
      }

      config = Object.assign({
        primaryKey : 'id',
        collection : true,
        parent     : null,
        key        : _getKey(n)
      }, o || {});

      resource = _getResource(n, config.parent);

      if (resource) {
        throw new TypeError('[ngMockRouter] - Provider.addResource: Resource ' + n + ' already exist.');
      } else {
        let newResource = {
          name : n
        };

        newResource.primaryKey = config.primaryKey;
        newResource.key        = config.key;
        newResource.collection = config.collection;
        newResource.data       = config.collection ? [] : {};

        if (config.parent) {
          let parent = _getResource(config.parent);
          if (parent) {
            if (newResource.collection && parent.keys.indexOf(newResource.key) > -1) {
              throw new TypeError('[ngMockRouter] - Provider.addResource: key ' + newResource.key + ' already exist. You can specify another one with the option key');
            }
            newResource.parent = config.parent;
          }
        }
        newResource.path = _getPath(newResource);
        newResource.id   = _getId(newResource);
        newResource.keys = _getKeys(newResource);

        $mockStorageProvider.setItem(newResource.id, newResource.data);

        resources.push(newResource);
      }
    }

    function _getResource(n, p) {
      return resources.find((r)=> {
        if (p) {
          return (r.name === n && r.parent === p);
        } else {
          return r.name === n;
        }
      });
    }

    function _getKey(n) {
      return 'id' + n.charAt(0).toUpperCase() + n.substr(1).toLowerCase();
    }

    function _getPath(r) {
      let path = '';
      if (r.parent) {
        path += _getResource(r.parent).path + '/';
      }
      path += r.name + (r.collection ? '/:' + r.key : '');

      return path;
    }

    function _getId(r) {
      let id = '';
      if (r.parent) {
        id += _getResource(r.parent).id + '_';
      }
      id += r.name;

      return id;
    }

    function _getKeys(r) {
      let keys = [];
      if (r.parent && r.collection) {
        keys = [..._getResource(r.parent).keys, r.key];
      } else if (r.parent) {
        keys = _getResource(r.parent).keys;
      } else if (r.collection) {
        keys = [r.key];
      }
      return keys;
    }

    function RouterService($log, $q, $mockStorage) {
      let service = {
        get         : get(),
        post        : post(),
        put         : put(),
        delete      : remove(),
        patch       : patch(),
        getResource : getResource
      };

      return service;

      function get() {
        return _createMethodWithoutData('get', function(d, r, p, rData, rIndex) {
          if (typeof rIndex !== 'undefined' && rIndex !== null) {
            rData = rData[rIndex];
          }
          _log('info', 'Response : ', 200, rData);
          d.resolve({
            status : 200,
            data   : rData
          });
        });
      }

      function post() {
        return _createMethodWithData('post', function(d, r, p, data, rData) {
          let id = Math.random().toString(36).substring(2);
          if (Array.isArray(rData)) {
            data[r.primaryKey] = id;
            rData.push(data);
            $mockStorage.setItem(r.id, rData);
            _log('info', 'Response : ', 200, data);
            d.resolve({
              status : 200,
              data   : data
            });
          } else {
            _log('info', 'Response : ', 405, {error : 'Method Not Allowed'});
            d.reject({
              status : 405,
              data   : {error : 'Method Not Allowed'}
            });
          }
        });
      }

      function put() {
        return _createMethodWithData('put', function(d, r, p, data, rData, rIndex) {
          rData[rIndex] = data;
          $mockStorage.setItem(r.id, rData);
          _log('info', 'Response : ', 200, rData[rIndex]);
          d.resolve({
            status : 200,
            data   : rData[rIndex]
          });
        });
      }

      function remove() {
        return _createMethodWithoutData('delete', function(d, r, p, rData, rIndex) {
          rData.splice(rIndex, 1);
          $mockStorage.setItem(r.id, rData);
          _log('info', 'Response : ', 200, rData);
          d.resolve({
            status : 200,
            data   : rData
          });
        });
      }

      function patch() {
        return _createMethodWithData('patch', function(d, r, p, data, rData, rIndex) {
          Object.assign(rData[rIndex], data);
          $mockStorage.setItem(r.id, rData);
          _log('info', 'Response : ', 200, rData[rIndex]);
          d.resolve({
            status : 200,
            data   : rData[rIndex]
          });
        });
      }

      function getResource(path) {
        path  = ('/' + path + '/').replace(/\/\//g, '/');
        let r = resources.find((r) => {
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
        return new RegExp('^' +
          path.replace(/\/\//g, '/')
            .replace(/\//g, '\\/')
            .replace(/\:[\w]*/g, '(?:([^\\/]*))') +
          '?$');
      }

      function _getParams(path, r) {
        let i,
            params = {},
            m      = path.match(_getRegex(r.path));

        for (i = 1; i < m.length; i++) {
          let key = r.keys[i - 1],
              val = _decodeParam(m[i]);

          if (val !== undefined || !(hasOwnProperty.call(params, key))) {
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
            err.status  = err.statusCode = 400;
          }
          throw err;
        }
      }

      function _log(l, ...msg) {
        if (Object.keys(availablesLogLevels).indexOf(l) > -1 && logLevel >= availablesLogLevels[l]) {
          $log[l](...msg);
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
          headers.split('\n').forEach(function(line) {
            i = line.indexOf(':');
            _fillInParsed(line.substr(0, i).trim().toLowerCase(), line.substr(i + 1).trim());
          });
        } else if (typeof headers === 'object') {
          Object.keys(headers).forEach(function(headerKey) {
            _fillInParsed(headerKey.toLowerCase(), headers[headerKey].trim());
          });
        }

        return parsed;
      }

      function _headersGetter(headers) {
        var headersObj;

        return function(name) {
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
          let i;
          for (i = 0; i < fns.length; i++) {
            let fn = fns[i];
            data   = fn(data, headers, status);
          }
        }
        return data;
      }

      function _createMethodWithoutData(name, callback) {
        return function(url, config) {
          return _createMethod(url, null, config, function(d, r, p, config) {
            let resourceId = p[r.key],
                rData      = $mockStorage.getItem(r.id);

            if (resourceId) {
              let rIndex = rData.findIndex((item) => String(item[r.primaryKey]) === String(resourceId));
              if (rIndex > -1) {
                callback(d, r, p, rData, rIndex);
              } else {
                _log('info', 'Response : ', 404, {error : 'Not Found'});
                d.reject({
                  status : 404,
                  data   : {error : 'Not Found'}
                });
              }
            } else if (name === 'get') {
              callback(d, r, p, rData);
            } else {
              _log('info', 'Response : ', 404, {error : 'No Id Given'});
              d.reject({
                status : 404,
                data   : {error : 'No Id Given'}
              });
            }
          });
        };
      }

      function _createMethodWithData(name, callback) {
        return function(url, data, config) {
          return _createMethod(url, data, config, function(d, r, p, config) {
            let resourceId = p[r.key],
                rData      = $mockStorage.getItem(r.id);

            data = _transformData(data, _headersGetter(config.headers), undefined, config.transformRequest);

            if (resourceId) {
              let rIndex = rData.findIndex((item) => String(item[r.primaryKey]) === String(resourceId));
              if (rIndex > -1) {
                callback(d, r, p, data, rData, rIndex);
              } else {
                _log('info', 'Response : ', 404, {error : 'Not Found'});
                d.reject({
                  status : 404,
                  data   : {error : 'Not Found'}
                });
              }
            } else if (name === 'post') {
              callback(d, r, p, data, rData);
            } else {
              _log('info', 'Response : ', 404, {error : 'No Id Given'});
              d.reject({
                status : 404,
                data   : {error : 'No Id Given'}
              });
            }
          });
        };
      }

      function _createMethod(url, data, config, callback) {
        _log('info', name.toUpperCase() + ' : ', url);
        if (data) {
          _log('info', 'Data : ', data);
        }
        if (config) {
          _log('info', 'Config : ', config);
        }
        let d = $q.defer(),
            [r, p] = getResource(url);

        config = Object.assign({
          transformRequest  : defaults.transformRequest,
          transformResponse : defaults.transformResponse
        }, config);

        //config.headers = _mergeHeaders(config);

        if (r) {
          callback(d, r, p, config);
        } else {
          _log('info', 'Response : ', 404, {error : 'Not a valid path!'});
          d.reject({
            status : 404,
            data   : {error : 'Not a valid path!'}
          });
        }
        return d.promise;
      }
    }
  }

  function ModuleConfig($provide) {
    httpDecorator.$inject = ['$delegate', '$mockRouter'];
    $provide.decorator('$http', httpDecorator);

    function httpDecorator($delegate, $mockRouter) {
      let wrapper = function() {
        return $delegate.apply($delegate, arguments);
      };
      // ["pendingRequests", "get", "delete", "head", "jsonp", "post", "put", "patch", "defaults"]
      // ["get", "delete", "head", "jsonp", "post", "put", "patch"]

      Object.keys($delegate).filter((k)=> typeof $delegate[k] === 'function')
        .forEach((k)=> {
          wrapper[k] = function() {
            if (typeof $mockRouter[k] === 'function') {
              return $mockRouter[k].apply($mockRouter, arguments);
            } else {
              return $delegate[k].apply($delegate, arguments);
            }
          };
        });
      Object.keys($delegate).filter((k)=> typeof $delegate[k] !== 'function')
        .forEach((k)=> {
          wrapper[k] = $delegate[k];
        });
      return wrapper;
    }
  }
})(window, window.angular);
