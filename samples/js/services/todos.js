(function() {
  'use strict';

  angular
    .module('todomvc')
    .factory('Todos', Todos);

  Todos.$inject = ['$http'];

  function Todos($http) {
    var URI     = '/api/todos',
        service = {
          fetch    : fetch,
          fetchOne : fetchOne,
          update   : update,
          create   : create,
          remove   : remove,
          patch    : patch
        };

    return service;

    function fetch() {
      return $http.get(URI);
    }

    function fetchOne(todoId) {
      return $http.get(URI + '/' + todoId);
    }

    function update(todo) {
      if (typeof todo.id !== 'undefined') {
        return $http.put(URI + '/' + todo.id, todo);
      } else {
        return create(todo);
      }
    }

    function patch(id, data) {
      return $http.patch(URI + '/' + id, data);
    }

    function create(todo) {
      return $http.post(URI, todo, {
        transformResponse : function(response) {
          var resp = angular.fromJson(response);
          delete resp.data.truc;
          return resp;
        }
      });
    }

    function remove(todo) {
      return $http.delete(URI + '/' + todo.id);
    }
  }
})();
