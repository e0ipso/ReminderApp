/**
 * Created by e0ipso on 10/14/13.
 */

(function(context){

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.debug(request);
    console.debug(sender);
    return 'This is the response.';
  });

})(window)