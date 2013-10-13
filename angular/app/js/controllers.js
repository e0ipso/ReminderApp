'use strict';

/* Controllers */

angular.module('reminderApp.controllers', ['ChromeStorageModule']).
  controller('TimerFormController', ['$scope', '$log', '$location', '$routeParams', 'timerService', function ($scope, $log, $location, $routeParams, timerService) {
    // Submit function.
    $scope.saveTimer = function () {
      var timer = $scope.timer;
      // Save it using the Chrome extension storage API.
      var key = timer.id;
      // TODO: Provide feedback if everything works.
      timerService.set(key, timer).then(function () {
        $location.path('/timers').replace();
      });
    }
    // Create ID dynamically.
    $scope.$watch('timer.name', function () {
      var id = $scope.timer.name;
      $scope.timer.id = id.replace(/[^a-zA-Z\d]/g, '-').toLowerCase().replace(/(^-+)|(-+$)/, '').replace(/--+/g, '-');
    });
    // TODO: Set the title based on the URL
    $scope.title = 'Add Timer';
    // Set the default value.
    if ($routeParams.timerId) {
      $scope.timer = timerService.get($routeParams.timerId);
    }
    else {
      $scope.timer = {
        name: '',
        id: '',
        description: '',
        frequency: 0,
        fromTime: '',
        toTime: ''
      };
    }
  }]).
  controller('TimerListController', ['$scope', 'timerService', function($scope, timerService) {
    // Get the available timers.
    // TODO: Convert to promises.
    $scope.timers = {};
    $scope.timers = timerService.all();
  }]).
  controller('NavigationMenuController', ['$scope', '$window', function($scope, $window) {
    $scope.closeWindow = function () {
      $window.close();
    }
  }]);