/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

angular.module('todos').controller('MainCtrl', ['$scope', '$routeParams', 'realtimeDocument', '$timeout',
  /**
   * Controller for editing the tasks lists
   *
   * @param {angular.Scope} $scope
   * @param {angular.$routeParams} $routeParams
   * @param document
   * @constructor
   */
  function ($scope, $routeParams, realtimeDocument,$timeout) {
    $scope.id = $routeParams.id;

    $scope.filter = $routeParams.filter;

    $scope.realtimeDocument = realtimeDocument;

    $scope.todos = realtimeDocument.getModel().getRoot().get('todos');

    $scope.newTodo = '';

    /**
     * Count the number of incomplete todo items.
     *
     * @returns {number}
     */
    $scope.remainingCount = function () {
      var remaining = 0;
      angular.forEach(this.todos.asArray(), function (todo) {
        remaining += Boolean(todo.completed) ? 0 : 1;
      });
      return remaining;
    };

    /**
     * Add a new todo item to the list, resets the new item text.
     */
    $scope.addTodo = function () {
      if (this.newTodo) {
//        realtimeDocument.getModel().beginCompoundOperation();
        var todo = realtimeDocument.getModel().create('todo', this.newTodo);
        todo.title = this.newTodo;
        todo.completed = false;
        this.newTodo = '';
        this.todos.push(todo);
//        realtimeDocument.getModel().endCompoundOperation();
      }
    };

    /**
     * Begin editing of an item.
     */
    $scope.editTodo = function (todo) {
      $scope.editedTodo = todo;
    };

    /**
     * Cancel editing.
     */
    $scope.doneEditing = function (title) {
      $scope.editedTodo = null;
    };

    /**
     * Delete an individual todo by removing it from the list.
     *
     * @param todo
     */
    $scope.removeTodo = function (todo) {
      this.todos.removeValue(todo);
    };

    /**
     * Remove all completed todos from the list
     */
    $scope.clearDoneTodos = function () {
      var todos = this.todos;
//      realtimeDocument.getModel().beginCompoundOperation();
      angular.forEach(this.todos.asArray(), function (todo) {
        if (todo.completed) {
          todos.removeValue(todo);
        }
      });
//      realtimeDocument.getModel().endCompoundOperation();
    };

    /**
     * Toggle the completed status of all items.
     *
     * @param done
     */
    $scope.markAll = function (done) {
//      realtimeDocument.getModel().beginCompoundOperation();
      angular.forEach(this.todos.asArray(), function (todo) {
//        todo.set('completed',done);
        todo.completed = done;
      });
//      realtimeDocument.getModel().endCompoundOperation();
    };

    $scope.$watch('filter', function (filter) {
      $scope.statusFilter = (filter === 'active') ?
      { completed: false } : (filter === 'completed') ?
      { completed: true } : null;
    });

    /**
    * Undo local changes
    */
    $scope.undo = function () {
      realtimeDocument.getModel().undo();
    };

    /**
    * Check if there are undoable changes.
    * @returns {boolean}
    */
    $scope.canUndo = function () {
      return realtimeDocument.getModel().canUndo();
    };

    /**
    * Undo local changes
    */
    $scope.redo = function () {
      realtimeDocument.getModel().redo();
    };

    /**
    * Check if there are redoable changes.
    * @returns {boolean}
    */
    $scope.canRedo = function () {
      return realtimeDocument.getModel().canRedo();
    };
  }]
);

angular.module('todos').controller('CollaboratorsCtrl', ['$scope',
  /**
   * Controller for displaying the list of current collaborators. Expects
   * to inherit the document from a parent scope.
   *
   * @param {angular.Scope} $scope
   * @constructor
   */
  function ($scope) {

    var collaboratorListener = function () {
      $scope.$apply(function () {
        $scope.collaborators = $scope.realtimeDocument.getCollaborators();
      });
    };
    $scope.collaborators = $scope.realtimeDocument.getCollaborators();

    var collaboratorLeftRegistration = $scope.realtimeDocument.onCollaboratorLeft(collaboratorListener);
    var collaboratorJoinedRegistration = $scope.realtimeDocument.onCollaboratorJoined(collaboratorListener);

    $scope.$on('$destroy', function () {
      var doc = $scope.realtimeDocument;
      if (doc) {
        collaboratorLeftRegistration.unregister();
        collaboratorJoinedRegistration.unregister();
      }
    });

  }]
);
