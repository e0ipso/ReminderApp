'use strict';


// Declare app level module which depends on filters, and services
angular.module('reminderApp', [
  'ngRoute',
  'reminderApp.filters',
  'reminderApp.services',
  'reminderApp.directives',
  'reminderApp.debug.controllers', // TODO: Remove this one on production.
  'reminderApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/timers', {templateUrl: 'partials/timers.html', controller: 'TimerListController'}).
    when('/debug', {templateUrl: 'partials/debug.html', controller: 'DebugController'}).
    when('/timer/add', {templateUrl: 'partials/timer-form.html', controller: 'TimerFormController'}).
    when('/timer/edit/:timerId', {templateUrl: 'partials/timer-form.html', controller: 'TimerFormController'}).
    otherwise({redirectTo: '/timers'});
}]);
