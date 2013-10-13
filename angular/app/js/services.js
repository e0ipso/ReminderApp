'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('reminderApp.services', ['ChromeStorageModule']).
  value('version', '0.1').
  value('timerPrefix', 'timer').
  factory('timerService', ['$q', 'chromeStorageService', 'timerPrefix', function($q, storage, timerPrefix) {
    // If there is a prefix set in the config lets use that with an appended period for readability
    if (timerPrefix.substr(-1) !== '.') {
      timerPrefix = !!timerPrefix ? timerPrefix + '.' : '';
    }

    return {
      get: function (key) {
        key = timerPrefix + key;
        return storage.get(key);
      },
      set: function (key, value) {
        key = timerPrefix + key;
        return storage.set(key, value);
      },
      all: function () {
        // Get the storage promise
        return storage.list(null).then(function (data) {
          // When the promise is fulfilled then return the filtered values.
          // data holds the prefixed values.
          var values = {};
          for (var key in data) {
            if (key.indexOf('.' + timerPrefix) != -1) {
              values[key] = data[key];
            }
          }
          return values;
        });
      },
      remove: function (keys) {
        // Prefix all variables prior to deletion.
        keys = keys.map(function (item) {
          return timerPrefix + item;
        });

        return storage.remove(keys);
      }
    };
  }]);