'use strict';

/* Controllers */

angular.module('reminderApp.controllers', ['ChromeStorageModule']).
  controller('TimerFormController', ['$scope', '$log', '$location', '$routeParams', 'timerService', function ($scope, $log, $location, $routeParams, timerService) {
    // Assume this is a new record
    $scope.editing = false;
    // Submit function.
    $scope.saveTimer = function () {
      var timer,
        save = function (timer) {
          var key = timer.id;
          // TODO: Provide feedback if everything works.
          // Save it using the timer service.
          timerService.set(key, timer).then(function () {
            $location.path('/timers').replace();
          });
        };
      // If the timer is a promise (when editing) we need to wait for the promise to fulfill.
      // To do so, test if the property 'then' is defined.
      if ($scope.timer.hasOwnProperty('then')) {
        $scope.timer.then(function (data) {
          save(data);
        });
      }
      else {
        save($scope.timer);
      }
    }

    // Delete timers
    $scope.showDeleteTimerModal = function () {
      jQuery('#deleteModal').modal('show');
    };
    $scope.deleteTimer = function () {
      // Assume we have a promise, since this will only be called from the editing form.
      $scope.timer.then(function (data) {
        timerService.remove([data.id]).then(function () {
          jQuery('#deleteModal').modal('hide');
          $location.path('/timers');
        });
      });
    }

    $scope.title = 'Add Timer';
    // Set the default value.
    if ($routeParams.timerId) {
      $scope.timer = timerService.get($routeParams.timerId);
      $scope.editing = true;
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

    // Create ID dynamically.
    $scope.$watch('timer.name', function () {
      var id = $scope.timer.name;
      // If there's an id in the URL don't change it with the title.
      if (id && !$scope.editing) {
        $scope.timer.id = id.replace(/[^a-zA-Z\d]/g, '-').toLowerCase().replace(/(^-+)|(-+$)/, '').replace(/--+/g, '-');
      }
    });
  }]).
  controller('TimerListController', ['$scope', '$location', 'timerService', function($scope, $location, timerService) {
    // Manual routing due to CSP
    $scope.editTimerForm = function (id) {
      $location.path('/timer/edit/' + id);
    }

    // Get the available timers.
    $scope.timers = {};
    $scope.timers = timerService.all();
  }]).
  controller('NavigationMenuController', ['$scope', '$window', function($scope, $window) {
    $scope.closeWindow = function () {
      $window.close();
    }
  }]);