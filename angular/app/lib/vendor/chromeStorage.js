'use strict';

// Create a new angular module.
var chromeStorage = angular.module('ChromeStorageModule', []);

// You should set a prefix to avoid overwriting any storage variables from the rest of your app
// e.g. chromeStorage.constant('prefix', 'youAppName');
chromeStorage.value('prefix', 'cs');
chromeStorage.value('namespace', 'sync'); // sync vs. local

// Define a service to inject.
chromeStorage.service('chromeStorageService', [
  '$rootScope',
  '$q',
  'prefix',
  'namespace',
  function ($rootScope, $q, prefix, namespace) {
    // If there is a prefix set in the config lets use that with an appended period for readability
    if (prefix.substr(-1)!=='.') {
      prefix = !!prefix ? prefix + '.' : '';
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
      object[prefix + key] = value;
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
     * @param callback
     *   Assync function call.
     */
    var getStorage = function (key, callback) {
      // Create the deferred object.
      var deferred = $q.defer();

      storage.get(prefix + key, function (data) {
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
              if (key.indexOf(prefix) == 0) {
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
          return prefix + item;
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
        return prefix + item;
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
]);
