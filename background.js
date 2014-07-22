/**
 * Created by e0ipso on 10/11/13.
 */

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('angular/app/index.html', {
    'id': 'reminderApp'
  });
  // Check for existing alarms and clear them.

  // Get the angular injector for the backgroundController and then derive all
  // the services and values from there.
  var domElement = document.querySelector('[ng-controller="backgroundController"]'),
    angularElement = angular.element(domElement),
    injector = angularElement.injector(),
    timerService = injector.get('timerService'),
    timerPrefix = injector.get('timerPrefix'),
    chromeStoragePrefix = injector.get('chromeStoragePrefix');
  // Add a period to the prefixes if there is none.
  if (timerPrefix.substr(-1) !== '.') {
    timerPrefix = !!timerPrefix ? timerPrefix + '.' : '';
  }
  if (chromeStoragePrefix.substr(-1) !== '.') {
    chromeStoragePrefix = !!chromeStoragePrefix ? chromeStoragePrefix + '.' : '';
  }

});
