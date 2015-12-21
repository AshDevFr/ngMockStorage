# ngMockStorage


[![Build Status](https://travis-ci.org/AshDevFr/ngMockStorage.svg?branch=master)](https://travis-ci.org/AshDevFr/ngMockStorage)


## Version 
Current version: 0.1.4

## Usage

### Installation

#### Npm
```sh
$ npm install ngmockstorage
```

#### Bower
```sh
$ bower install ngMockStorage
```

### Configuration

#### Add to your project
```js
(function() {
  'use strict';

  angular.module('<project name>', ['ngMockStorage', ...]);
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
```js
(function() {
  'use strict';

  angular.module('<project name>')
    .config(configFn);

  configFn.$inject = ['$mockRouterProvider'];

  function configFn($mockRouterProvider) {
    $mockRouterProvider.addResource('todos');
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

## ChangeLog
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
