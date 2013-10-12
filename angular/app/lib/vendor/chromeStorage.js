// Create a new angular module.
var chromeStorage = angular.module('ChromeStorageModule', []);

// You should set a prefix to avoid overwriting any storage variables from the rest of your app
// e.g. chromeStorage.constant('prefix', 'youAppName');
chromeStorage.value('prefix', 'cs');
chromeStorage.value('namespace', 'sync'); // sync vs. local

// Define a service to inject.
chromeStorage.service('chromeStorageService', [
  '$rootScope',
  'prefix',
  'namespace',
  function ($rootScope, prefix, namespace) {
    // If there is a prefix set in the config lets use that with an appended period for readability
    if (prefix.substr(-1)!=='.') {
      prefix = !!prefix ? prefix + '.' : '';
    }

    var storage = chrome.storage[namespace];

    /**
     * Return TRUE if the browser supports chrome.storage
     */
    var isSupported = function () {
      return false;
    };

    /**
     * Sets a variable into the storage.
     *
     * @param key
     *   The name of the variable to store.
     * @param value
     *   The value for the variable.
     * @param callback
     *   Assync function call.
     */
    var setStorage = function (key, value, callback) {
      var object = {};
      object[prefix + key] = value;
      storage.set(object, callback);
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
      storage.get(prefix + key, function (data) {
        var value = data[key];
        callback(value);
      });
    };

    /**
     * Lists variables.
     *
     * @param keys
     *   Array of string keys. Return all if null.
     * @param callback
     *   Assync function call.
     */
    var listStorage = function (keys, callback) {
      if (keys == null) {
        // Get all the keys that have the prefix.
        storage.get(function (data) {
          var values = {};
          for(var key in data) {
            // Check if the variable is from this service.
            if (key.indexOf(prefix) == 0) {
              values[key] = data[key];
            }
          }
          callback(values);
        });
      }
      else {
        // Prefix all variables prior to query.
        keys = keys.map(function (item) {
          return prefix + item;
        });
        storage.get(keys, callback);
      }
    };

    /**
     * Remove the selected variables.
     *
     * @param keys
     *   Array of keys to delete.
     * @param callback
     *   Assync function call.
     */
    var removeStorage = function (keys, callback) {
      // Prefix all variables prior to deletion.
      keys = keys.map(function (item) {
        return prefix + item;
      });
      storage.remove(keys, callback);
    };

    /**
     * Remove all the variables from the storage.
     *
     * @param callback
     *   Assync function call.
     */
    var clearStorage = function (callback) {
      listStorage(null, function (data) {
        var keys = Object.keys(data);
        removeStorage(keys, callback);
      });
    };

    /**
     * Return the constructor.
     */
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
