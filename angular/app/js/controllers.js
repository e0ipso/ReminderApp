'use strict';

/* Controllers */

angular.module('reminderApp.controllers', []).
  controller('TimerFormController', ['$scope', '$log', function($scope, $log) {
    // Submit function.
    $scope.saveTimer = function () {
      var timer = $scope.timer;
      // Save it using the Chrome extension storage API.
      var key = timer.id;
      chrome.storage.sync.set({key: timer}, function() {
        // Notify that we saved.
        $log.log(chrome.storage.sync.get(key));
      });
    };
    // Create ID dynamically.
    $scope.$watch('timer.name', function () {
      var id = $scope.timer.name;
      $scope.timer.id = id.replace(/[^a-zA-Z\d]/g, '-').toLowerCase().replace(/(^-+)|(-+$)/, '').replace(/--+/g, '-');
    });
    // TODO: Set the title based on the URL
    $scope.title = 'Add Timer';
    // Set the default value.
    // TODO: Populate the loadedTimer based on the URL
    $scope.timer = {
      name: '',
      id: '',
      description: '',
      frequency: 0,
      fromTime: '',
      toTime: ''
    };
  }])
  .controller('MyCtrl2', [function() {

  }]);