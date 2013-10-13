'use strict';

/* Directives */


angular.module('reminderApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('activeLink', ['$location', function(location) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, controller) {
        var clazz = attrs.activeLink;
        var path = attrs.href;
        path = path.substring(1); //hack because path does bot return including hashbang
        scope.location = location;
        scope.$watch('location.path()', function(newPath) {
          if (path === newPath) {
            element.parent().addClass(clazz);
          } else {
            element.parent().removeClass(clazz);
          }
        });
      }
    };

  }]);
