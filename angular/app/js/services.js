'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('reminderApp.services', ['ngResource']).
  value('version', '0.1').
  factory('timerService', [function(localStorage) {
    return {
      create: function (data) {

      },
      update: function (id, data) {
        localStorage.addToLocalStorage(id, data);
      },
      delete: function (id) {
        localStorage.remove(id);
      }
    };
  }]);