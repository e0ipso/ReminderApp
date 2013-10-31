'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('reminderApp.reminderProviders', ['ChromeStorageModule']).
  factory('ReminderProviderManagerService', [function () {
    function RemiderProviderManager(object) {
      // Left empty on purpose.
    }

    /**
     * @var string type
     *   The type of the reminder. Usually one of:
     *     - text
     *     - internal
     *     - web-service
     */
    RemiderProviderManager.prototype.type = 'text';

    /**
     * @var string title
     *   The human title for this provider.
     */
    RemiderProviderManager.prototype.title = '<empty>';

    /**
     * @var string description
     *   Description of what this provider does.
     */
    RemiderProviderManager.prototype.description = '<empty>';

    /**
     * @var array actions
     *   Array of objects containing all the actions available to the reminder.
     */
    RemiderProviderManager.prototype.actions = [{
      location: '#', // APP URI where to go on click.
      title: '<empty>',
      id: '<empty>',
      description: '<empty>',
      icon: '', // Image to load for the notification.
      options: {}, // An object with variables to set available to the scope.
      settings: {
        formUriAction: '#', // URI to a form where to configure this action.
        variablesAction: {}, // Object containing the variables that will be set in formUri.
        /**
         * Receives a callback that will get called if the action is valid.
         * @param callback
         */
        validAction: function (callback) { callback(this, null); } // Callback to determine if this action may be used or not.
      }
    }];

    /**
     * Callback that determines if this reminder is valid.
     *
     * @param callback
     *   Gets called asynchronously then the validation has been resolved,
     *   receives the ReminderProviderManager.
     */
    RemiderProviderManager.prototype.valid = function (callback) {
      // If there is one valid action then the provider is considered valid.
      /** @var Generic scope variable to indicate if the success callback has been called */
      var executed = false;
      for (var i = this.actions.length - 1; i <= 0; i--) {
        this.actions[i].validAction(function (reminder, actionId) {
          // If the callback has not been executed yet, then execute it.
          if (!executed) {
            executed = true;
            callback(reminder);
          }
        });
        if (executed) {
          break;
        }
      }
    };


    /**
     * @var string formUri
     *   APP URI to a form where to configure this action.
     */
    RemiderProviderManager.prototype.formUri = '#';

    /**
     * @var object variables
     *   Object of variables that will be made available for general configuration.
     */
    RemiderProviderManager.prototype.variables = {};

    return function () {
      return new RemiderProviderManager();
    };
  }]).
  /**
   * Declares the basic provider types, if you need a ned provider type inject
   * it here and add it to the return object.
   */
  value('providerPrefix', 'provider').
  service('ReminderProviderTypesService', ['ReminderProviderManagerService', 'namespacedChromeStorageService', 'providerPrefix', function (ProviderManager, NamespacedStorage, providerPrefix) {
    var providerList = [],
      basic = {},
      configurable = {},
      actionCount = 0,
      storage = new NamespacedStorage(providerPrefix),
      provider = new ProviderManager();
    /**
     * Text provider. Shows a basic notification based on the timer data,
     * overridable by custom configuration.
     */
    provider.type = 'text';
    provider.title = 'Text reminders';
    provider.description = 'Text reminders are simple reminders that will pop up a notification with some text in it.';
    provider.actions = [];
    // Default action.
    basic.id = 'basic-notification';
    basic.description = 'The basic text notification will use the data stored in the timer to show the notification';
    basic.location = '/reminder/' + provider.type;
    basic.title = 'Basic notification action';
    basic.icon = chrome.runtime.getURL('/angular/app/img/bell.png');
    // action.options = storage.get(provider.type + '.options');
    basic.options = null;
    basic.settings = null; // Since the data is fetched from the timer there is
                            // no configuration needed.
    basic.validAction = function (callback) {
      // This will be executed on runtime, after the action options have been
      // filled. Check if the action has the notification object in it.
      if (this.options != null && typeof this.options.notification != 'undefined') {
        callback(this, 'basic-notification');
      }
    };
    actionCount++;
    provider.actions.push(basic);
    // Configurable action.
    configurable.id = 'configurable-notification';
    configurable.description = 'The configurable text notification will display a notification with the data present in the settings for this action.';
    configurable.location = '/reminder/' + provider.type + '/' + configurable.id; // TODO: Set up the route to hold the reminder/text landing
    configurable.title = 'Configurable notification action';
    configurable.icon = chrome.runtime.getURL('/angular/app/img/bell.png');
    configurable.options = null;
    configurable.settings = {
      formUri: '/reminder/settings/' + provider.type + '/' + configurable.id, // TODO: Set up the route to the configuration form.
      variables: storage.get(provider.type + '.' + configurable.id + '.variables')
    };
    configurable.validAction = function (callback) {
      // This will be executed on runtime, after the action options have been
      // filled. Check if the action has the notification object in it.
      if (this.options != null && typeof this.options.notification != 'undefined') {
        // Check if there is info set in the variable settings for this action.
        var reminderObject = this;
        this.settings.variables.then(function(data) {
          if (typeof data != 'undefined' && Object.keys(data).length !== 0) {
            callback(reminderObject, 'configurable-notification');
          }
        });
      }
    };
    actionCount++;
    provider.actions.push(configurable);
    // provider.valid will be left as default.
    providerList.push(provider);
    return {
      count: providerList.length,
      actionCount: actionCount,
      list: providerList
    };
  }]);