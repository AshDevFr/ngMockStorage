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
        namespace = '',
        resources = [];

    RouterService.$inject = ['$log', '$q', '$mockStorage'];

    provider = {
      setNamespace : setNamespace,
      addResource  : addResource,
      $get         : RouterService
    };

    return provider;

    function setNamespace(n) {
      if (typeof n !== 'string') {
        throw new TypeError('[ngMockRouter] - Provider.setNamespace expects a string.');
      }
      namespace = n;
    }

    function addResource(n, o) {
      let options, resource;
      if (typeof n !== 'string') {
        throw new TypeError('[ngMockRouter] - Provider.addResource expects string, [object].');
      }

      if (o && typeof o !== 'object') {
        throw new TypeError('[ngMockRouter] - Provider.addResource expects string, [object].');
      }

      options = Object.assign({
        primaryKey : 'id',
        collection : true,
        parent     : null,
        key        : _getKey(n)
      }, o || {});

      resource = _getResource(n, options.parent);

      if (resource) {
        throw new TypeError('[ngMockRouter] - Provider.addResource: Resource ' + n + ' already exist.');
      } else {
        let newResource = {
          name : n
        };

        newResource.primaryKey = options.primaryKey;
        newResource.key        = options.key;
        newResource.collection = options.collection;
        newResource.data       = options.collection ? [] : {};

        if (options.parent) {
          let parent = _getResource(options.parent);
          if (parent) {
            if (newResource.collection && parent.keys.indexOf(newResource.key) > -1) {
              throw new TypeError('[ngMockRouter] - Provider.addResource: key ' + newResource.key + ' already exist. You can specify another one with the option key');
            }
            newResource.parent = options.parent;
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
        get         : get,
        post        : post,
        put         : put,
        remove      : remove,
        patch       : patch,
        getResource : getResource
      };
      return service;

      function get(url, options) {
        let rData,
            d = $q.defer(),
            [r, p] = getResource(url);

        if (r) {
          let resourceId = p[r.key];
          rData          = $mockStorage.getItem(r.id);
          if (resourceId) {
            let result = rData.find((item) => String(item[r.primaryKey]) === String(resourceId));
            if (result) {
              d.resolve({
                status : 200,
                data   : result
              });
            } else {
              d.reject({
                status : 404,
                data   : {error : 'Not Found'}
              });
            }
          } else {
            d.resolve({
              status : 200,
              data   : rData
            });
          }
        } else {
          d.reject({
            status : 404,
            data   : {error : 'Not a valid path!'}
          });
        }
        return d.promise;
      }

      function post(url, data, options) {
        let rData,
            d  = $q.defer(),
            id = Math.random().toString(36).substring(2),
            [r, p] = getResource(url);

        if (r) {
          rData = $mockStorage.getItem(r.id);
          if (Array.isArray(rData)) {
            data[r.primaryKey] = id;
            rData.push(data);
            $mockStorage.setItem(r.id, rData);
            d.resolve({
              status : 200,
              data   : data
            });
          } else {
            d.reject({
              status : 405,
              data   : {error : 'Method Not Allowed'}
            });
          }
        } else {
          d.reject({
            status : 404,
            data   : {error : 'Not a valid path!'}
          });
        }
        return d.promise;

      }

      function put(url, data, options) {
        let rData,
            d = $q.defer(),
            [r, p] = getResource(url);

        if (r) {
          let resourceId = p[r.key];
          rData          = $mockStorage.getItem(r.id);
          if (resourceId) {
            let rIndex = rData.findIndex((item) => String(item[r.primaryKey]) === String(resourceId));
            if (rIndex > -1) {
              rData[rIndex] = data;
              $mockStorage.setItem(r.id, rData);
              d.resolve({
                status : 200,
                data   : rData[rIndex]
              });
            } else {
              d.reject({
                status : 404,
                data   : {error : 'Not Found'}
              });
            }
          } else {
            d.reject({
              status : 404,
              data   : {error : 'Not Id Given'}
            });
          }
        } else {
          d.reject({
            status : 404,
            data   : {error : 'Not a valid path!'}
          });
        }
        return d.promise;
      }

      function remove(url, options) {
        let rData,
            d = $q.defer(),
            [r, p] = getResource(url);

        if (r) {
          let resourceId = p[r.key];
          rData          = $mockStorage.getItem(r.id);
          if (resourceId) {
            let rIndex = rData.findIndex((item) => String(item[r.primaryKey]) === String(resourceId));
            if (rIndex > -1) {
              rData.splice(rIndex, 1);
              $mockStorage.setItem(r.id, rData);
              d.resolve({
                status : 200,
                data   : rData
              });
            } else {
              d.reject({
                status : 404,
                data   : {error : 'Not Found'}
              });
            }
          } else {
            d.reject({
              status : 404,
              data   : {error : 'Not Id Given'}
            });
          }
        } else {
          d.reject({
            status : 404,
            data   : {error : 'Not a valid path!'}
          });
        }
        return d.promise;
      }

      function patch(url, data, options) {
        let rData,
            d = $q.defer(),
            [r, p] = getResource(url);

        if (r) {
          let resourceId = p[r.key];
          rData          = $mockStorage.getItem(r.id);
          if (resourceId) {
            let rIndex = rData.findIndex((item) => String(item[r.primaryKey]) === String(resourceId));
            if (rIndex > -1) {
              Object.assign(rData[rIndex], data);
              $mockStorage.setItem(r.id, rData);
              d.resolve({
                status : 200,
                data   : rData[rIndex]
              });
            } else {
              d.reject({
                status : 404,
                data   : {error : 'Not Found'}
              });
            }
          } else {
            d.reject({
              status : 404,
              data   : {error : 'Not Id Given'}
            });
          }
        } else {
          d.reject({
            status : 404,
            data   : {error : 'Not a valid path!'}
          });
        }
        return d.promise;
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
            return $delegate[k].apply($delegate, arguments);
          };
        });
      wrapper['get']    = function() {
        return $mockRouter.get(...arguments);
      };
      wrapper['post']   = function() {
        return $mockRouter.post(...arguments);
      };
      wrapper['put']    = function() {
        return $mockRouter.put(...arguments);
      };
      wrapper['patch']  = function() {
        return $mockRouter.patch(...arguments);
      };
      wrapper['delete'] = function() {
        return $mockRouter.remove(...arguments);
      };
      return wrapper;
    }
  }
})(window, window.angular);
