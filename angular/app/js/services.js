'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('reminderApp.services', ['ChromeStorageModule']).
  value('version', '0.1').
  value('timerPrefix', 'timer').
  value('profilePrefix', 'profile').
  factory('timerService', ['$q', 'namespacedChromeStorageService', 'timerPrefix', function($q, namespacedStorage, timerPrefix) {
    // If there is a prefix set in the config lets use that with an appended period for readability
    if (timerPrefix.substr(-1) !== '.') {
      timerPrefix = !!timerPrefix ? timerPrefix + '.' : '';
    }
    function Timer(object) {
      this.init(object);
      // Get all the alarms filtered by the timerPrefix.
      var alarmNames = [];
      chrome.alarms.getAll(function (alarms) {
        for (var index = alarms.length - 1; index >= 0; index--) {
          if (alarms[index].name.indexOf(timerPrefix) == 0) {
            alarmNames.push(alarms[index].name);
          }
        }
      });
      this.alarmNames = alarmNames;
    }

    Timer.prototype.init = function (object) {
      for (var key in object) {
        this[key] = object[key];
      }
    };

    /**
     * Get the status of the timer based on the current time.
     *
     * @returns {string}
     */
    Timer.prototype.getStatus = function () {
      var from = this.fromTime, to = this.toTime;
      if (from >= to) {
        return 'error';
      }
      else {
        var now = new Date(), nowTime;
        nowTime = now.getHours() + ':' + now.getMinutes();
        if (from < nowTime && nowTime < to) {
          return 'active';
        }
        return 'inactive';
      }
    };

    /**
     * Get the alarm bound to this timer (if any).
     *
     * return Alarm
     *   Return (a promise of) the alarm or false if there is none.
     */
    Timer.prototype.getAlarm = function () {
      var deferred = $q.defer(),
        alarmName = timerPrefix + this.id;
      if (this.hasAlarm()) {
        chrome.alarms.get(alarmName, function (alarm) {
          deferred.resolve(alarm);
        });
      }
      else {
        deferred.reject('The alarm ' + alarmName + ' was not found.');
      }
      return deferred.promise;
    };

    /**
     * Check if this timer has an associated alarm in the system.
     *
     * @return bool
     *   TRUE if the alarm was registered.
     */
    Timer.prototype.hasAlarm = function () {
      var alarmName = timerPrefix + this.id;
      return this.alarmNames.indexOf(alarmName) != -1;
    };

    /**
     * Set alarm for the timer.
     */
    Timer.prototype.setAlarm = function () {
      // Check if the timer is active or inactive
      switch (this.getStatus()) {
        case 'active':
          // Set the alarm and make it repeat forever. We will need to make
          // sure we disable the alarm when to match the from/to
          // constraints.
          this.alarm = chrome.alarms.create(timerPrefix + this.id, {
            periodInMinutes: this.frequency
          });
          break;
        case 'inactive':
          // If the alarm is inactive then set the first to the fromTime and
          // then repeat frequency.
          var startTime = new Date(),
            parts = this.fromTime.split(':');
          startTime.setHours(parts[0]);
          startTime.setMinutes(parts[1]);
          startTime.setSeconds('00');
          this.alarm = chrome.alarms.create(timerPrefix + this.id, {
            when: startTime.getTime(),
            periodInMinutes: this.frequency
          });
          break;
        default:
          break;
      }
    };

    /**
     * Remove the alarm for the current timer.
     */
    Timer.prototype.removeAlarm = function () {
      var alarmName = timerPrefix + this.id;
      chrome.alarms.clear(alarmName);
    };

    var timerStorage = namespacedStorage(timerPrefix);
    timerStorage.create = function (object) {
      return new Timer(object);
    };

    return timerStorage;
  }]).
  service('profileService', ['$q', 'namespacedChromeStorageService', 'profilePrefix', function($q, storage, prefix) {
    // If there is a prefix set in the config lets use that with an appended period for readability
    if (prefix.substr(-1) !== '.') {
      prefix = !!prefix ? prefix + '.' : '';
    }
    var profileStorage = storage(prefix);
    return {
      get: function () {
        return profileStorage.get('profile');
      },
      set: function (profileObject) {
        return profileStorage.set('profile', profileObject);
      },
      remove: function (profileObject) {
        return profileStorage.remove(['profile']);
      }
    };
  }]);
