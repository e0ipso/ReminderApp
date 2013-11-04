'use strict';

// Create a new angular module.
var MessageCenterModule = angular.module('MessageCenterModule', []);

// Define a service to inject.
MessageCenterModule.
  factory('MessageCenterService', [
    '$rootScope',
    function ($rootScope) {
      $rootScope.mcMessages = [];
      /**
       * Return the constructor.
       */
      function MessageCenterService() {
        // Remove all shown messages upon construction.
        for (var index = $rootScope.mcMessages.length - 1; index >= 0; index--) {
          if ($rootScope.mcMessages[index].status == 'shown') {
            $rootScope.mcMessages.splice(index, 1);
          }
        }
      }
      MessageCenterService.prototype = {
        unseen: 'unseen',
        shown: 'shown',
        add: function (type, message) {
          var availableTypes = ['info', 'warning', 'danger', 'success'],
            service = this;
          if (availableTypes.indexOf(type) == -1) {
            throw "Invalid message type";
          }
          return $rootScope.mcMessages.push({
            type: type,
            message: message,
            status: this.unseen,
            close: function() {
              return service.closeMessage(this);
            }
          });
        },
        remove: function (message) {
          var index = $rootScope.mcMessages.indexOf(message);
          return $rootScope.mcMessages.splice(index, 1);
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
      return MessageCenterService;
    }
  ]).
  directive('mcMessages', ['$rootScope', 'MessageCenterService', function ($rootScope, MessageCenterService) {
    var messages = new MessageCenterService();
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
          messages.removeShown();
          // Update 'unseen' messages to be marked as 'shown'.
          messages.markShown();
        };
        $rootScope.$on('$locationChangeSuccess', changeReaction);
        // If ui-router is enabled we need to do this.
        $rootScope.$on('$stateChangeSuccess', changeReaction);
      }
    };
  }]);
