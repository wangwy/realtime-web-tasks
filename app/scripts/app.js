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
 * @param storage
 * @returns {*}
 */
app.loadFile = function (storage,$route) {
  var id = $route.current.params.id;
  if(!id){
    id = 0;
  }
  app.id = 'tasks/'+id;
  return storage.getDocument(app.id);
};

app.loadFile.$inject = ['storage','$route'];

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
        .otherwise({redirectTo:'/todos/0/all'})
  }]
);

app.module.value('config',CONFIG);

$(document).ready(function () {
  angular.bootstrap(document, ['todos']);
});