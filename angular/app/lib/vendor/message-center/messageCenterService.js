'use strict';

// Create a new angular module.
var MessageCenterModule = angular.module('MessageCenterModule', []);

// Define a service to inject.
MessageCenterModule.
  service('messageCenterService', [
    '$rootScope',
    function ($rootScope) {
      $rootScope.mcMessages = $rootScope.mcMessages || [];
      return {
        unseen: 'unseen',
        shown: 'shown',
        add: function (type, message) {
          var availableTypes = ['info', 'warning', 'danger', 'success'],
            service = this;
          if (availableTypes.indexOf(type) == -1) {
            throw "Invalid message type";
          }
          $rootScope.mcMessages.push({
            type: type,
            message: message,
            status: this.unseen,
            close: function() {
              return service.remove(this);
            }
          });
        },
        remove: function (message) {
          var index = $rootScope.mcMessages.indexOf(message);
          $rootScope.mcMessages.splice(index, 1);
        },
        reset: function () {
          $rootScope.mcMessages = [];
        },
        removeShown: function () {
          for (var index = $rootScope.mcMessages.length - 1; index >= 0; index--) {
            if ($rootScope.mcMessages[index].status == this.shown) {
              this.remove($rootScope.mcMessages[index]);
            }
          }
        },
        markShown: function () {
          for (var index = $rootScope.mcMessages.length - 1; index >= 0; index--) {
            if ($rootScope.mcMessages[index].status == this.unseen) {
              $rootScope.mcMessages[index].status = this.shown;
            }
          }
        }
      };
    }
  ]).
  directive('mcMessages', ['$rootScope', 'messageCenterService', function ($rootScope, messageCenterService) {
    return {
      restrict: 'EA',
      template: '\
      <div id="mc-messages-wrapper">\
        <div class="alert alert-{{ message.type }} fade in" ng-repeat="message in mcMessages">\
          <a class="close" ng-click="message.close();" data-dismiss="alert" aria-hidden="true">&times;</a>\
          {{ message.message }}\
        </div>\
      </div>\
      ',
      compile: function(element, attrs) {
        var changeReaction = function () {
          // Remove the messages that have been shown.
          messageCenterService.removeShown();
          // Update 'unseen' messages to be marked as 'shown'.
          messageCenterService.markShown();
        };
        $rootScope.$watch('mcMessages', function(newValue, oldValue) {
          console.log(newValue);
        });
        $rootScope.$on('$locationChangeSuccess', changeReaction);
        // If ui-router is enabled we need to do this.
        $rootScope.$on('$stateChangeSuccess', changeReaction);
      }
    };
  }]);
