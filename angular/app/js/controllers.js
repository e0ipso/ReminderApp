'use strict';

/* Controllers */

angular.module('reminderApp.controllers', ['ChromeStorageModule']).
  config(['$compileProvider', function( $compileProvider ) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|blob):/);
  }]).
  controller('TimerFormController', ['$scope', '$log', '$location', '$routeParams', 'timerService', function ($scope, $log, $location, $routeParams, timerService) {
    // Assume this is a new record
    $scope.editing = false;
    // Submit function.
    $scope.saveTimer = function () {
      var timer,
        save = function (timer) {
          var key = timer.id;
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
            $location.path('/timer/' + timer.id).search({saved: true});
          }, function (reason) {
            $location.path('/timer/' + timer.id).search({saved: false, reason: reason});
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
    };

    // Delete timers
    $scope.showDeleteTimerModal = function () {
      $('#deleteModal').modal('show');
    };
    $scope.deleteTimer = function () {
      // Assume we have a promise, since this will only be called from the editing form.
      $scope.timer.then(function (data) {
        timerService.remove([data.id]).then(function () {
          $('#deleteModal').modal('hide');
          $location.path('/timers');
        });
      });
    };

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
  .controller('TimerViewController', ['$scope', '$routeParams', '$location', 'timerService', function ($scope, $routeParams, $location, timerService) {
    $scope.timer = timerService.get($routeParams.timerId);
    $scope.timer.then(function (timer) {
      $scope.status = timerService.create(timer).getStatus();
    });
    $scope.saveSuccess = typeof $location.search()['saved'] && $location.search()['saved'];
  }])
  .controller('ProfileViewController', ['$scope', '$location', '$q', 'gravatarImageService', 'profileService', function ($scope, $location, $q, gravatarImageService, profileService) {
    $scope.profile = profileService.get();
    $scope.profile.then(function (profile) {
      var xhr = new XMLHttpRequest(),
        src = gravatarImageService.getImageSrc(profile.mail, 60, '', chrome.runtime.getURL('/angular/app/img/bell.png'), true),
        deferred = $q.defer();
      xhr.open('GET', src, true);
      xhr.responseType = 'blob';

      xhr.onload = function(e) {
        deferred.resolve(window.webkitURL.createObjectURL(this.response));
      };

      xhr.send();
      $scope.gravatarSrc = deferred.promise;
    });
    $scope.saveSuccess = typeof $location.search()['saved'] && $location.search()['saved'];
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
            $location.path('/profile').search({saved: true});
          }, function (reason) {
            $location.path('/timer/' + timer.id).search({saved: false, reason: reason});
          }); // TODO: Error handling for the services and alert messages when error.
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
    };
    // Scope function to show the clear modal.
    $scope.showClearProfileModal = function () {
      $('#deleteModal').modal('show');
    };
    // Scope function to actually clear the profile data.
    $scope.clearProfile = function () {
      // Assume we have a promise, since this will only be called from the editing form.
      $scope.profile.then(function (data) {
        profileService.remove().then(function () {
          $('#deleteModal').modal('hide');
          $location.path('/profile');
        });
      });
    }

  }])
  .controller('ReminderFormController', ['$scope', '$routeParams', '$log', '$timeout', 'timerService', 'ReminderProviderTypesService', function ($scope, $routeParams, $log, $timeout, timerService, providerTypes) {
    $scope.timer = timerService.get($routeParams.timerId);
    $scope.providers = providerTypes.list;
    // Initialize popover
    angular.element(document).ready(function () {
      $('.panel-action').popover(); // TODO: Change all jQuery calls to use jq-passthrough. @see: http://angular-ui.github.io/ui-utils/
    });
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
