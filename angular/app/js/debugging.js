'use strict';

/* Controllers */

angular.module('reminderApp.debug.controllers', ['MessageCenterModule']).
  controller('DebugController', ['$scope', '$log', '$location', 'messageCenterService', function ($scope, $log, $location, messageCenterService) {
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
            $scope.openUri('timer/add');
            $log.log('Button %d clicked on %s.', buttonIndex, notificationId);
            break;
          case 1:
            break;
        }
      }
    });
    $scope.defaultUrl = chrome.runtime.getURL('');
    $scope.openUri = function (uri) {
      chrome.runtime.sendMessage(
        { uri: uri, action: 'openAppURI' }
      );
    };
    // Test the alert functionality.
    messageCenterService.add('success', 'Testing alert.');
    messageCenterService.add('info', 'Testing alert.');
    messageCenterService.add('warning', 'Testing alert.');
    messageCenterService.add('danger', 'Testing alert.');
    $scope.clickedAlert = function () {
      messageCenterService.add('warning', 'Clicked alert.');
    };
  }]);