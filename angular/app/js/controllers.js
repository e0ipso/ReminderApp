'use strict';

/* Controllers */

angular.module('reminderApp.controllers', ['ChromeStorageModule']).
  config(['$compileProvider', function( $compileProvider ) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
  }]).
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
            // Since the logic for the timer may have been changed, remove the
            // associated alarms and recreate them.
            var timerObject = timerService.create(timer);
            if (timerObject.hasAlarm()) {
              // Remove the alarm.
              timerObject.removeAlarm();
              // Create the alarm again.
              timerObject.createAlarm();
            }
            $location.path('/timer/' + timer.id).replace();
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
      $scope.title = 'Add Timer';
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
    // Get the available timers.
    $scope.timers = {};
    $scope.timers = timerService.all();
    $scope.timers.then(function (data) {
      $scope.numTimers = Object.keys(data).length;
    });
    $scope.appName = chrome.i18n.getMessage('appName');
  }]).
  controller('NavigationMenuController', ['$scope', '$window', function($scope, $window) {
    $scope.closeWindow = function () {
      $window.close();
    };
    $scope.appName = chrome.i18n.getMessage('appName');
  }])
  .controller('TimerViewController', ['$scope', '$routeParams', 'timerService', function ($scope, $routeParams, timerService) {
    $scope.timer = timerService.get($routeParams.timerId);
    $scope.timer.then(function (timer) {
      $scope.status = timerService.create(timer).getStatus();
    });
  }])
  .controller('ProfileViewController', ['$scope', 'profileService', function ($scope, profileService) {
    $scope.profile = profileService.get();
  }])
  .controller('ProfileFormController', ['$scope', '$location', 'profileService', function ($scope, $location, profileService) {
    // Assume that there is no profile data stored.
    $scope.editing = false;
    $scope.profile = profileService.get();
    $scope.profile.then(function (data) {
      // If there is profile data set the editing variable to true.
      if (typeof data.name != 'undefined') {
        $scope.editing = true;
      }
    });
    // Scope function to create/update profile data.
    $scope.saveProfile = function () {
      var profile,
        save = function (profile) {
          // Save it using the profile service.
          profileService.set(profile).then(function () {
            $location.path('/profile').replace();
          });
        };
      // If the profile is a promise (when editing) we need to wait for the promise to fulfill.
      // To do so, test if the property 'then' is defined.
      // TODO: Check if this is a good practise.
      if ($scope.profile.hasOwnProperty('then')) {
        $scope.profile.then(function (data) {
          save(data);
        });
      }
      else {
        save($scope.profile);
      }
    }
    // Scope function to show the clear modal.
    $scope.showClearProfileModal = function () {
      jQuery('#deleteModal').modal('show');
    };
    // Scope function to actually clear the profile data.
    $scope.clearProfile = function () {
      // Assume we have a promise, since this will only be called from the editing form.
      $scope.profile.then(function (data) {
        profileService.remove().then(function () {
          jQuery('#deleteModal').modal('hide');
          $location.path('/profile');
        });
      });
    }

  }])
  .controller('backgroundController', ['$log', 'timerService', function ($log, timerService) {
    var timerData = timerService.all();
    timerData.then(function (data) {
      for (var key in data) {
        var timer = timerService.create(data[key]);
        // Check if there's an alarm attached to the timer. Only act if there
        // are no alarms.
        if (!timer.hasAlarm()) {
          timer.setAlarm();
        }
      }
    });
  }]);
