'use strict';

// Create a new angular module.
var chromeStorage = angular.module('ChromeStorageModule', []);

// You should set a prefix to avoid overwriting any storage variables from the rest of your app
// e.g. chromeStorage.constant('chromeStoragePrefix', 'youAppName');
chromeStorage.value('chromeStoragePrefix', 'cs');
chromeStorage.value('namespace', 'sync'); // sync vs. local

// Define a service to inject.
chromeStorage.
  service('chromeStorageService', [
    '$rootScope',
    '$q',
    'chromeStoragePrefix',
    'namespace',
    function ($rootScope, $q, chromeStoragePrefix, namespace) {
      // If there is a prefix set in the config lets use that with an appended period for readability
      if (chromeStoragePrefix.substr(-1)!=='.') {
        chromeStoragePrefix = !!chromeStoragePrefix ? chromeStoragePrefix + '.' : '';
      }

      var storage = null;
      try {
        storage = chrome.storage[namespace];
      }
      catch (e) {}

      /**
       * Return TRUE if the browser supports chrome.storage
       */
      var isSupported = function () {
        try {
          chrome.storage[namespace].getBytesInUse(function () {});
          return true;
        }
        catch (e) {
          // Chrome storage is not supported for this namespace.
          $rootScope.$broadcast('ChromeStorageModule.notification.error',e.message);
          return false;
        }
      };

      /**
       * Sets a variable into the storage.
       *
       * @param key
       *   The name of the variable to store.
       * @param value
       *   The value for the variable.
       * @return object
       *   Promise object.
       */
      var setStorage = function (key, value) {
        // Create the deferred object.
        var deferred = $q.defer();

        var object = {};
        object[chromeStoragePrefix + key] = value;
        storage.set(object, function () {
          if (chrome.runtime.lastError) {
            deferred.reject(chrome.runtime.lastError.message);
          }
          else {
            deferred.resolve('The data was saved correctly.');
          }
        });

        // Return the promise ouf of the deferred object.
        return deferred.promise;
      };

      /**
       * Gets a variable from the storage.
       *
       * @param key
       *   Name of the variable to get.
       * @return object
       *   Promise object.
       */
      var getStorage = function (key) {
        // Create the deferred object.
        var deferred = $q.defer();

        storage.get(chromeStoragePrefix + key, function (data) {
          var value = data[key];
          if (chrome.runtime.lastError) {
            deferred.reject(chrome.runtime.lastError.message);
          }
          else {
            // Return the first object.
            for (var key in data) {
              data = data[key];
              break;
            }
            deferred.resolve(data);
          }
        });

        // Return the promise ouf of the deferred object.
        return deferred.promise;
      };

      /**
       * Lists variables.
       *
       * @param keys
       *   Array of string keys. Return all if null.
       * @return object
       *   Promise object.
       */
      var listStorage = function (keys) {
        // Create the deferred object.
        var deferred = $q.defer();

        if (keys == null) {
          // Get all the keys that have the prefix.
          storage.get(function (data) {
            if (chrome.runtime.lastError) {
              deferred.reject(chrome.runtime.lastError.message);
            }
            else {
              var values = {};
              for(var key in data) {
                // Check if the variable is from this service.
                if (key.indexOf(chromeStoragePrefix) == 0) {
                  values[key] = data[key];
                }
              }
              deferred.resolve(values);
            }
          });
        }
        else {
          // Prefix all variables prior to query.
          keys = keys.map(function (item) {
            return chromeStoragePrefix + item;
          });
          storage.get(keys, function (data) {
            if (chrome.runtime.lastError) {
              deferred.reject(chrome.runtime.lastError.message);
            }
            else {
              deferred.resolve(data);
            }
          });
        }

        // Return the promise ouf of the deferred object.
        return deferred.promise;
      };

      /**
       * Remove the selected variables.
       *
       * @param keys
       *   Array of keys to delete.
       * @return object
       *   Promise object.
       */
      var removeStorage = function (keys, callback) {
        // Create the deferred object.
        var deferred = $q.defer();

        // Prefix all variables prior to deletion.
        keys = keys.map(function (item) {
          return chromeStoragePrefix + item;
        });
        storage.remove(keys, function () {
          if (chrome.runtime.lastError) {
            deferred.reject(chrome.runtime.lastError.message);
          }
          else {
            deferred.resolve('The data was successfully removed.');
          }
        });

        // Return the promise ouf of the deferred object.
        return deferred.promise;
      };

      /**
       * Remove all the variables from the storage.
       *
       * @return object
       *   Promise object.
       */
      var clearStorage = function (callback) {
        // Get the promise of all the data.
        return listStorage(null).then(function (data) {
          var keys = Object.keys(data);
          // When we have all the data *then* get the promise of removing it.
          return removeStorage(keys);
        });
      };

      /**
       * Return the constructor.
       */
      // TODO: Add methods to get information about the storage.
      return {
        'isSupported': isSupported,
        'set': setStorage,
        'get': getStorage,
        'remove': removeStorage,
        'list': listStorage,
        'clear': clearStorage
      }
    }
  ]).
  factory('namespacedChromeStorageService', ['chromeStorageService', function (storage) {
    function ChromeStorage(prefix) {
      this.prefix = prefix;
    }
    ChromeStorage.prototype.get = function (key) {
      key = this.prefix + key;
      return storage.get(key);
    };
    ChromeStorage.prototype.set = function (key, value) {
      key = this.prefix + key;
      return storage.set(key, value);
    };
    ChromeStorage.prototype.all = function () {
      var prefix = this.prefix;
      // Get the storage promise
      return storage.list(null).then(function (data) {
        // When the promise is fulfilled then return the filtered values.
        // data holds the prefixed values.
        var values = {};
        for (var key in data) {
          if (key.indexOf('.' + prefix) != -1) {
            values[key] = data[key];
          }
        }
        return values;
      });
    };
    ChromeStorage.prototype.remove = function (keys) {
      var prefix = this.prefix;
      // Prefix all variables prior to deletion.
      keys = keys.map(function (item) {
        return prefix + item;
      });

      return storage.remove(keys);
    };
    return function (prefix) {
      return new ChromeStorage(prefix);
    };
  }]);
