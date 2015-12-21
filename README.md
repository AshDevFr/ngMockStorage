# ngMockStorage


[![Build Status](https://travis-ci.org/AshDevFr/ngMockStorage.svg?branch=master)](https://travis-ci.org/AshDevFr/ngMockStorage)


## Version 
Current version: 0.1.5

## Usage

### Installation

#### Npm
```sh
$ npm install ngmockstorage
```

#### Bower
```sh
$ bower install ngmockstorage
```

### Configuration

#### Add to your project
```js
(function() {
  'use strict';

  angular.module('<project name>', ['ngMockStorage', ...]);
})();
```

#### Define the storage
```js
(function() {
  'use strict';

  angular.module('<project name>')
    .config(configFn);

  configFn.$inject = ['$mockStorageProvider'];

  function configFn($mockStorageProvider) {
    $mockStorageProvider.setStorageType('sessionStorage');
  }
})();
```

#### Define the storage key prefix
```js
(function() {
  'use strict';

  angular.module('<project name>')
    .config(configFn);

  configFn.$inject = ['$mockStorageProvider'];

  function configFn($mockStorageProvider) {
    $mockStorageProvider.setKeyPrefix('ngMockStorage-');
  }
})();
```

#### Define the namespace
```js
(function() {
  'use strict';

  angular.module('<project name>')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider'];

  function configFn($mockRouterProvider) {
    $mockRouterProvider.setNamespace('api');
  }
})();
```

#### Add a resource

The name format : \<parent resource name\>.\<resource name\>

Options : 

* __primaryKey__: ___(default: 'id')___ identifier of the resource
* __key__: ___(default: 'id\<Resource name\>')___ param name in the url /\<resource name\>/:key
* __collection__: ___(default: true)___ define if the resource is an object or a array


```js
(function() {
  'use strict';

  angular.module('<project name>')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider'];

  function configFn($mockRouterProvider) {
    $mockRouterProvider.addResource('todos');
    $mockRouterProvider.addResource('todos.infos', {collection : false});
  }
})();
```

#### Load datas
```js
(function() {
  'use strict';

  angular.module('<project name>')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider'];

  function configFn($mockRouterProvider) {
    $mockRouterProvider.addResource('todos');

    $mockRouterProvider.loadDatas('todos', [
      {
        id     : 1,
        title  : 'Todos 1',
        isDone : false
      },
      {
        id     : 2,
        title  : 'Todos 2',
        isDone : false
      }
    ]);
  }
})();
```

#### Set log level

(error / warn / info / debug)

```js
(function() {
  'use strict';

  angular.module('<project name>')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider'];

  function configFn($mockRouterProvider) {
    $mockRouterProvider.setLogLevel('info');
  }
})();
```


## Todo
* Write a proper README
* Optimize code
* Load datas
* Write tests

## ChangeLog
* 0.1.5
```
Library :
  - Add loadDatas method
```
* 0.1.4
```
Library : 
  - Add interceptors support
  - Add request/response transformations support
  
Samples : 
  - Add interceptors
  - Add transformRequest & TransformResponse
```
* 0.1.3
```
Remove some duplicate code
Add a serve task in gulp
```
* 0.1.2
```
Remove some duplicate code
```
