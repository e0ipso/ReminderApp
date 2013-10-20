'use strict';

/**
 * Created by e0ipso on 10/14/13.
 */

(function(context){

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (sender.id == chrome.runtime.id && request.action) {
      var app = chrome.app.window.current();
      switch (request.action) {
        case 'openAppURI':
          app.contentWindow.location.hash = '#/' + request.uri;
          app.focus();
          break;
      }
    }
  });

  var notificationIndex = 0; // TODO: Globals are evil, can we do this better?

  /**
   * The following code is in charge of receiving alarm events, making sure they
   * belong to timer timeouts and then firing the notification. This code needs
   * to live in a global state so we only add the listener once.
   */
  chrome.alarms.onAlarm.addListener(function (alarm) {
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

    // Check if this is a timer alarm.
    if (alarm.name.indexOf(timerPrefix) != -1) {
      // Remove the timerPrefix from the alarm name to get the timer id.
      var timerName = alarm.name.substring(alarm.name.indexOf(timerPrefix) + timerPrefix.length);
      // Get the information about the timer.
      timerService.get(timerName).then(function (timer) {
        // Set up a notification based on the timer information.
        // TODO: This belongs to the Timer/Reminder object.
        chrome.notifications.create('notification_timer.' + notificationIndex++ + '.' + chromeStoragePrefix + alarm.name, {
          type: 'basic',
          title: timer.name,
          message: timer.description,
          iconUrl: chrome.runtime.getURL('/angular/app/img/bell.png')
        }, function (notificationId) {
          console.log('Notification created: %s', notificationId);
        });
        // Check if this alarm should keep going or we should pause it until
        // tomorrow.
        var nextAlarm = new Date(alarm.scheduledTime);
        if (nextAlarm.getHours() + ':' + nextAlarm.getMinutes() > timer.toTime) {
          // Set the date to tomorrow
          var tomorrow = new Date(),
            parts = timer.fromTime.split(':');
          tomorrow.setTime(new Date().getTime() +  (24 * 60 * 60 * 1000));
          // Now modify the hours and minutes.
          tomorrow.setHours(parts[0]);
          tomorrow.setMinutes(parts[1]);
          // Set the alarm for tomorrow at the start time.
          chrome.alarms.clear(alarm.name);
          chrome.alarms.create(alarm.name, {
            when: tomorrow.getTime(),
            periodInMinutes: alarm.periodInMinutes
          });
        }
      });
    }
  });

})(window)
