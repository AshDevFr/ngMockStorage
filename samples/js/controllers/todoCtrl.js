/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
  .controller('TodoCtrl', function TodoCtrl($scope, $location, $filter, Todos) {
    Todos.fetch().then(function(response) {
      $scope.todos          = response.data;
      $scope.remainingCount = $filter('filter')($scope.todos, {completed : false}).length;
    }, function(error) {
      console.error(error);
    });

    $scope.newTodo    = '';
    $scope.editedTodo = null;

    if ($location.path() === '') {
      $location.path('/');
    }

    $scope.location = $location;

    $scope.$watch('location.path()', function(path) {
      $scope.statusFilter = {'/active' : {completed : false}, '/completed' : {completed : true}}[path];
    });

    $scope.$watch('remainingCount == 0', function(val) {
      $scope.allChecked = val;
    });

    $scope.addTodo = function() {
      var newTodo = {
        title     : $scope.newTodo.trim(),
        completed : false
      };
      if (newTodo.title.length === 0) {
        return;
      }

      Todos.create(newTodo).then(function(response) {
        $scope.todos.push(response.data);
      }, function(error) {
        console.error(error);
      });

      $scope.newTodo = '';
      $scope.remainingCount++;
    };

    $scope.editTodo = function(todo) {
      $scope.editedTodo = todo;
      // Clone the original todo to restore it on demand.
      $scope.originalTodo = angular.extend({}, todo);
    };

    $scope.doneEditing = function(todo) {
      $scope.editedTodo = null;
      todo.title        = todo.title.trim();

      if (!todo.title) {
        $scope.removeTodo(todo);
      } else {
        Todos.update(todo).then(function(response) {
          todo = response.data;
        }, function(error) {
          console.error(error);
        });
      }
    };

    $scope.revertEditing = function(todo) {
      $scope.todos[$scope.todos.indexOf(todo)] = $scope.originalTodo;
      $scope.doneEditing($scope.originalTodo);
    };

    $scope.removeTodo = function(todo) {
      Todos.remove(todo).then(function(response) {
        $scope.remainingCount -= todo.completed ? 0 : 1;
        $scope.todos.splice($scope.todos.indexOf(todo), 1);
      }, function(error) {
        console.error(error);
      });
    };

    $scope.todoCompleted = function(todo) {
      $scope.remainingCount += todo.completed ? -1 : 1;
      Todos.patch(todo.id, {completed : todo.completed}).then(function(response) {
        todo = response.data;
      }, function(error) {
        console.error(error);
      });
    };

    $scope.clearCompletedTodos = function() {
      var i,
          todos = $scope.todos.filter(function(val) {
            return val.completed;
          });

      for (i = 0; i < todos.length; i++) {
        $scope.removeTodo(todos[i]);
      }
    };

    $scope.markAll = function(completed) {
      $scope.todos.forEach(function(todo) {
        todo.completed = completed;
        $scope.todoCompleted(todo);
      });
      $scope.remainingCount = completed ? $scope.todos.length : 0;
    };
  });
