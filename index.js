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

})(window)
