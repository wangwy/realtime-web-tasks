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

angular.module('todos').service('storage', ['$q', '$rootScope', 'config',
  /**
   * Handles document creation & loading for the app. Keeps only
   * one document loaded at a time.
   *
   * @param $q
   * @param $rootScope
   */
   function ($q, $rootScope, config) {
    this.id = null;
    this.document = null;

    /**
     * Close the current document.
     */
    this.closeDocument = function () {
      this.document.close();
      this.document = null;
      this.id = null;
    };

    /**
     * Ensure the document is loaded.
     *
     * @param id
     * @returns {angular.$q.promise}
     */
    this.getDocument = function (id) {
      if (this.id === id) {
        return $q.when(this.document);
      } else if (this.document) {
        this.closeDocument();
      }
        return this.load(id);
      };

    /**
     * Actually load a document. If the document is new, initializes
     * the model with an empty list of todos.
     *
     * @param id
     * @returns {angular.$q.promise}
     */
    this.load = function (id) {
      init();
      var deferred = $q.defer();
      var initialize = function (model) {
        model.getRoot().set('todos', model.createList());
      };
      var onLoad = function (document) {
        this.setDocument(id, document);
        deferred.resolve(document);
        $rootScope.$digest();
      }.bind(this);
      var onError = function (error) {
        if (error.type === realtime.store.ErrorType.TOKEN_REFRESH_REQUIRED) {
          $rootScope.$emit('todos.token_refresh_required');
        } else if (error.type === realtime.store.ErrorType.CLIENT_ERROR) {
          $rootScope.$emit('todos.client_error');
        } else if (error.type === realtime.store.ErrorType.NOT_FOUND) {
          deferred.reject(error);
          $rootScope.$emit('todos.not_found', id);
        }
        $rootScope.$digest();
      };
      var store = new realtime.store.StoreImpl(config.SERVER, null);
      //
      realtime.store.custom.registerType(app.Todo, 'todo');
      app.Todo.prototype.title = realtime.store.custom.collaborativeField('title');
      app.Todo.prototype.completed = realtime.store.custom.collaborativeField('completed');
      store.load(id, onLoad, initialize, onError);
      return deferred.promise;
    };

    /**
     * Watches the model for any remote changes to force a digest cycle
     *
     * @param event
     */
    this.changeListener = function (event) {
      if (!event.isLocal()) {
        $rootScope.$digest();
      }
    };

    this.setDocument = function (id, document) {
      document.getModel().getRoot().onObjectChanged(this.changeListener)
      this.document = document;
      this.id = id;
    };
  }]
);
