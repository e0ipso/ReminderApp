'use strict';

/* Controllers */

angular.module('reminderApp.controllers', ['ChromeStorageModule']).
  config(['$compileProvider', function( $compileProvider ) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|blob):/);
  }]).
  controller('TimerFormController', ['$scope', '$log', '$state', 'timer', 'timerService', function ($scope, $log, $state, timer, timerService) {
    // Assume this is a new record
    $scope.editing = false;
    // Submit function.
    $scope.saveTimer = function () {
      var key = $scope.timer.id;
      // Save it using the timer service.
      timerService.set(key, $scope.timer).then(function () {
        // Since the logic for the timer may have been changed, remove the
        // associated alarms and recreate them.
        var timerObject = timerService.create($scope.timer);
        if (timerObject.hasAlarm()) {
          // Remove the alarm.
          timerObject.removeAlarm();
          // Create the alarm again.
          timerObject.createAlarm();
        }
        if ($scope.editing) {
          $state.go('^.view');
        }
        $state.go('^.detail.view', { timerId: $scope.timer.id });
          // TODO: State alternative to query params => .search({saved: true});
      }, function (reason) {
        $state.go('home');
          // TODO: State alternative to query params => .search({saved: false, reason: reason});
      });
    };

    // Delete timers
    $scope.showDeleteTimerModal = function () {
      $('#deleteModal').modal('show');
    };
    // Call the timerService to perform the actual deletion.
    $scope.deleteTimer = function () {
      timerService.remove([timer.id]).then(function () {
        $('#deleteModal').modal('hide');
        $state.go('home');
      });
    };

    $scope.timer = timer;
    // Set the default value.
    if (!timer.name) {
      $scope.title = 'Add Timer';
    }
    else {
      // If there is a default name for the timer then assume we're editing.
      $scope.editing = true;
    }

    // Create ID dynamically.
    // TODO: Could this be refactored into a filter?
    $scope.$watch('timer.name', function () {
      var id = $scope.timer.name;
      // If there's an id in the URL don't change it with the title.
      if (id && !$scope.editing) {
        $scope.timer.id = id.replace(/[^a-zA-Z\d]/g, '-').toLowerCase().replace(/(^-+)|(-+$)/, '').replace(/--+/g, '-');
      }
    });
  }]).
  controller('TimerListController', ['$scope', 'timerService', function($scope, timerService) {
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
  .controller('TimerViewController', ['$scope', '$routeParams', '$state', 'timer', 'timerService', function ($scope, $routeParams, $state, timer, timerService) {
    $scope.timer = timer;
    $scope.status = timerService.create(timer).getStatus();
    // $scope.saveSuccess = typeof $state.search()['saved'] && $state.search()['saved']; TODO: Reimplement this using states.
  }])
  .controller('ProfileViewController', ['$scope', '$state', '$q', 'gravatarImageService', 'profile', function ($scope, $state, $q, gravatarImageService, profile) {
    $scope.profile = profile;
    if ($scope.profile.mail) {
      var xhr = new XMLHttpRequest(),
        src = gravatarImageService.getImageSrc($scope.profile.mail, 60, '', chrome.runtime.getURL('/angular/app/img/bell.png'), true),
        deferred = $q.defer();
      xhr.open('GET', src, true);
      xhr.responseType = 'blob';

      xhr.onload = function(e) {
        deferred.resolve(window.webkitURL.createObjectURL(this.response));
      };

      xhr.send();
      $scope.gravatarSrc = deferred.promise;
    }
    // $scope.saveSuccess = typeof $state.search()['saved'] && $state.search()['saved']; TODO: Reimplement this using states.
  }])
  .controller('ProfileFormController', ['$scope', '$state', 'profile', 'profileService', function ($scope, $state,  profile, profileService) {
    // Assume that there is no profile data stored.
    $scope.editing = false;
    $scope.profile = profile;
    // If there is profile data set the editing variable to true.
    if (typeof $scope.profile.name != 'undefined') {
      $scope.editing = true;
    }
    // Scope function to create/update profile data.
    $scope.saveProfile = function () {
      // Save it using the profile service.
      profileService.set($scope.profile).then(function () {
        $state.go('^.view');
          // TODO: State alternative to query params => .search({saved: true});
      }, function (reason) {
        $state.go('^.view');
          // TODO: State alternative to query params => .search({saved: false, reason: reason});
      }); // TODO: Error handling for the services and alert messages when error.
    };
    // Scope function to show the clear modal.
    $scope.showClearProfileModal = function () {
      $('#deleteModal').modal('show');
    };
    // Scope function to actually clear the profile data.
    $scope.clearProfile = function () {
      // Assume we have a promise, since this will only be called from the editing form.
      profileService.remove().then(function () {
        $('#deleteModal').modal('hide');
        $state.go('home');
      });
    }

  }])
  .controller('ReminderFormController', ['$scope', '$routeParams', '$log', '$timeout', 'timer', 'providers', function ($scope, $routeParams, $log, $timeout, timer, providers) {
    $scope.timer = timer;
    $scope.providers = providers;
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
