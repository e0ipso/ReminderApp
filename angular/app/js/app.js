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
  'md5',
  'ui.router'
]).
config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider.
    state('home', {url: '/timers', templateUrl: 'partials/timers/timers.html', controller: 'TimerListController'}).
    state('debug', {url: '/debug', templateUrl: 'partials/debug.html', controller: 'DebugController'}).
    state('timers', {abstract: true, url: '/timer', template: '<ui-view/>'}).
      state('timers.add', {url: '/add', templateUrl: 'partials/timers/timer-form.html', controller: 'TimerFormController', resolve: {
        timer: function () {
          return {
            name: '',
            id: '',
            description: '',
            frequency: 0,
            fromTime: '',
            toTime: ''
          }
        }
      }}).
      state('timers.detail', {abstract: true, url: '/:timerId', template: '<ui-view>', resolve: {
        timer: ['$stateParams', 'timerService', function($stateParams, timerService) {
          return timerService.get($stateParams.timerId);
        }]
      }}).
        state('timers.detail.view', {url: '', templateUrl: 'partials/timers/timer.html', controller: 'TimerViewController'}).
        state('timers.detail.edit', {url: '/edit', templateUrl: 'partials/timers/timer-form.html', controller: 'TimerFormController'}).
        state('timers.detail.reminders', {url: '/reminders', templateUrl: 'partials/reminders/timer-reminder-form.html', controller: 'ReminderFormController', resolve: {
          providers: ['ReminderProviderTypesService', function (providerTypes) {
            return providerTypes.list;
          }]
        }}).
    state('profile', {abstract: true, url: '/profile', template: '<ui-view/>', resolve: {
      profile: ['profileService', function (profileService) {
        return profileService.get();
      }]
    }}).
      state('profile.view', {url: '', templateUrl: 'partials/profile/profile.html', controller: 'ProfileViewController'}).
      state('profile.edit', {url: '/edit', templateUrl: 'partials/profile/profile-form.html', controller: 'ProfileFormController'});
  $urlRouterProvider.
    otherwise('/timers');
}]);
