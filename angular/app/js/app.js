'use strict';


// Declare app level module which depends on filters, and services
angular.module('reminderApp', [
  'ngRoute',
  'reminderApp.filters',
  'reminderApp.services',
  'reminderApp.directives',
  'reminderApp.debug.controllers', // TODO: Remove this one on production.
  'reminderApp.controllers',
  'reminderApp.reminderProviders',
  'ui-gravatar',
  'md5'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/timers', {templateUrl: 'partials/timers/timers.html', controller: 'TimerListController'}).
    when('/debug', {templateUrl: 'partials/debug.html', controller: 'DebugController'}).
    when('/timer/add', {templateUrl: 'partials/timers/timer-form.html', controller: 'TimerFormController'}).
    when('/timer/:timerId/edit', {templateUrl: 'partials/timers/timer-form.html', controller: 'TimerFormController'}).
    when('/timer/:timerId', {templateUrl: 'partials/timers/timer.html', controller: 'TimerViewController'}).
    when('/timer/:timerId/reminders', {templateUrl: 'partials/reminders/timer-reminder-form.html', controller: 'ReminderFormController'}).
    when('/profile', {templateUrl: 'partials/profile/profile.html', controller: 'ProfileViewController'}).
    when('/profile/edit', {templateUrl: 'partials/profile/profile-form.html', controller: 'ProfileFormController'}).
    otherwise({redirectTo: '/timers'});
}]);
