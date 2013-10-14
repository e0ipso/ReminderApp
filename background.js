/**
 * Created by e0ipso on 10/11/13.
 */

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('angular/app/index.html', {
    'id': 'reminderApp'
  });
});

function responseCallback() {}
function onMessage(message, sender, responseCallback) {
  alert('Ola ke ase!');
  chrome.app.window.create(message.url, {
    'id': 'reminderApp'
  });
}
chrome.app.runtime.onMessageExternal.addListener(onMessage);