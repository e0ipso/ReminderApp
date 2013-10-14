'use strict';

/* Controllers */

angular.module('reminderApp.debug.controllers', []).
  controller('DebugController', ['$scope', '$log', '$location', function ($scope, $log, $location) {
    // Debug controller.
    var id = 0;
    $scope.notification = function () {
      chrome.notifications.create('notification_debug_' + id, {
        type: 'basic',
        title: 'Debug',
        message: 'This is a testing notification, please use without caution.',
        iconUrl: chrome.runtime.getURL('/angular/app/img/bell.png'),
        buttons: [{
          title: 'Add timer',
          iconUrl: chrome.runtime.getURL('/angular/app/img/bell.png')
        }, {
          title: 'Button 2',
          iconUrl: chrome.runtime.getURL('/angular/app/img/bell.png')
        }]
      }, function (notificationId) {
        id++;
        $log.log('Notification created: %s', notificationId);
      })
    };
    chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
      if (notificationId.indexOf('notification_debug_') == 0) {
        switch (buttonIndex) {
          case 0:
            $scope.openUrl('add/timer');
            $log.log('Button %d clicked on %s.', buttonIndex, notificationId);
            break;
          case 1:
            break;
        }
      }
    });
    $scope.defaultUrl = chrome.runtime.getURL('');
    $scope.openUrl = function (url) {
      chrome.runtime.sendMessage(
        { url: 'angular/app/index.html' + '#/' + url, action: 'openAppURI' },
        function (response) { $log.log(response); }
      );
    };
  }]);