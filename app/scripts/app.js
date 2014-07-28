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

var CONFIG = {
  SERVER:'http://realtime.goodow.com:1986/channel'
};

var app = {};

app.module = angular.module('todos', []);

/**
 * A simple type for todo items.
 * @constructor
 */
app.Todo = function () {
};

/**
 * Initializer for constructing via the realtime API
 *
 * @param title
 */
app.Todo.prototype.initialize = function (title) {
  var model = realtime.store.custom.getModel(this);
  this.title = model.createString(title);
  this.completed = false;
};


/**
 * Loads the document. Used to inject the collaborative document
 * into the main controller.
 *
 * @param $route
 * @param storage
 * @returns {*}
 */
app.loadFile = function ($route, storage) {
  var id = $route.current.params.id;
  if(!id){
    id = 0;
  }
  app.id = 'tasks/'+id;
  return storage.getDocument(app.id);
};

app.loadFile.$inject = ['$route', 'storage'];

/**
 * Initialize our application routes
 */
app.module.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider
      .when('/todos/:id/:filter', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          realtimeDocument: app.loadFile
        }
      })
      .otherwise({
        redirectTo: '/todos/0/'
      });
  }]
);

app.module.value('config', CONFIG);

  realtime.store.custom.registerType(app.Todo, 'todo');
  app.Todo.prototype.title = realtime.store.custom.collaborativeField('title');
  app.Todo.prototype.completed = realtime.store.custom.collaborativeField('completed');
  realtime.store.custom.setInitializer('todo', app.Todo.prototype.initialize);

  $(document).ready(function () {
    Object.defineProperty(realtime.store.CollaborativeString.prototype, 'text', {
      set: realtime.store.CollaborativeString.prototype.setText,
      get: realtime.store.CollaborativeString.prototype.getText
    });
    init();
    angular.bootstrap(document, ['todos']);
  });