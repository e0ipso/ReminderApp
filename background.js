/**
 * Created by e0ipso on 10/11/13.
 */

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('angular/app/index.html', {
    'id': 'reminderApp'
  });
});