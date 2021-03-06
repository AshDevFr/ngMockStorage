# ngMockStorage


[![Build Status](https://travis-ci.org/AshDevFr/ngMockStorage.svg?branch=master)](https://travis-ci.org/AshDevFr/ngMockStorage)


![NPM](https://nodei.co/npm/ngmockstorage.png?downloads=true&downloadRank=true&stars=true)

## Version 
Current version: 0.1.10

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

(__localStorage__ / sessionStorage)

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

#### Enable Advanced Mode
```js
(function() {
  'use strict';

  angular.module('<project name>')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider'];

  function configFn($mockRouterProvider) {
    $mockRouterProvider.setRouteMode('advanced');
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

##### Simple mode
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
    
    $mockRouterProvider.addResource('todos.detail', {collection: false});

    $mockRouterProvider.loadDatas('todos', {
      createdBy: 'Someone'
    });
  }
})();
```

##### Advanced mode
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
    
    $mockRouterProvider.addResource('todos.detail', {collection: false});

    $mockRouterProvider.loadDatas('todos', {
      createdBy: 'Someone'
    }, {idTodos: 1);
    
    $mockRouterProvider.loadDatas('todos', {
      createdBy: 'Another one'
    }, {idTodos: 2);
  }
})();
```

#### Set log level

(__error__ / warn / info / debug)

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
* Write tests

## ChangeLog
* 0.1.10
```
Add an advanced mode to allow a more compliant mock system
```
* 0.1.9
```
Fix issue with put/patch when the resource is not a collection
```
* 0.1.8
```
Add Object.assign polyfill
```
* 0.1.7
```
Library :
  - Code refacto
  - $http fallback
  
Samples :
  - Fix tranformRequest issue
```
* 0.1.6
```
Add a not uglified file in dist
```
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
