'use strict';

/* Filters */

angular.module('reminderApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  // Gets an amount of minutes and outputs the formatted time.
  filter('timeUnits', [function(minutes) {
    return function(minutes) {
      var time = [],
        integer = 0;
      // Years
      integer = Math.floor(minutes / (60 * 24 * 365));
      time.push(integer);
      minutes -= integer * (60 * 24 * 365);
      // Months
      integer = Math.floor(minutes / (60 * 24 * 365 / 12));
      time.push(integer);
      minutes -= integer * (60 * 24 * 365 / 12);
      // Days
      integer = Math.floor(minutes / (60 * 24));
      time.push(integer);
      minutes -= integer * (60 * 24);
      // Hours
      integer = Math.floor(minutes / 60);
      time.push(integer);
      minutes -= integer * 60;
      // Minutes
      time.push(minutes);
      // Iterate and create the output string.
      var output = '',
        units = ['year', 'month', 'day', 'hour', 'minute'];

      for (var index = 0; index < time.length; index++) {
        if (time[index]) {
          output += ' ' + time[index] + ' ' + units[index];
          if (time[index] > 1) {
            // Pluralize. All units pluralize OK adding an 's' at the end.
            output += 's';
          }
        }
      }
      return output.replace(/(^\s+)|(\s+$)/, '');
    }
  }]);
