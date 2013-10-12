'use strict';


// Declare app level module which depends on filters, and services
angular.module('reminderApp', [
  'ngRoute',
  'reminderApp.filters',
  'reminderApp.services',
  'reminderApp.directives',
  'reminderApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/timers', {templateUrl: 'partials/timers.html', controller: 'TimerListController'});
  $routeProvider.when('/timer/add', {templateUrl: 'partials/timer-form.html', controller: 'TimerFormController'});
  $routeProvider.otherwise({redirectTo: '/timers'});
}]);
