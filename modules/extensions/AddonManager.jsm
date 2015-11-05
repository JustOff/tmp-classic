/**
 * original code by onemen
 */

"use strict";

this.EXPORTED_SYMBOLS = ["TabmixAddonManager"];

const Cu = Components.utils;

Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("resource://tabmixplus/Services.jsm");

// https://addons.mozilla.org/en-US/firefox/addon/private-tab
var PrivateTab = {
  id: "privateTab@infocatcher",
  onEnabled: function() {
    this._resetNewTabButton();
  },
  onDisabled: function() {
    this._resetNewTabButton();
  },
  _resetNewTabButton: function() {
    TabmixSvc.forEachBrowserWindow(function(aWindow) {
      aWindow.TMP_eventListener.updateMultiRow(true);
    });
  }
};

var SessionManager = {
  id: "{1280606b-2510-4fe0-97ef-9b5a22eafe30}",
  init: function() {
    this._saveTabmixPrefs();
    try {
      let tmp = {};
      Cu.import("chrome://sessionmanager/content/modules/session_manager.jsm", tmp);
      TabmixSvc.sessionManagerAddonInstalled = true;
    }
    catch (ex) {
      TabmixSvc.sessionManagerAddonInstalled = false;
    }
  },
  _saveTabmixPrefs: function() {
    this.manager_enabled = TabmixSvc.prefBranch.getBoolPref("sessions.manager");
    this.crashRecovery_enabled = TabmixSvc.prefBranch.getBoolPref("sessions.crashRecovery");
  },
  onEnabled: function() {
    TabmixSvc.sessionManagerAddonInstalled = true;
    this._saveTabmixPrefs();
    let win = TabmixSvc.topWin();
    if (win)
      win.TMP_SessionStore.setService(-1);
    this._notify(true);
  },
  onDisabled: function() {
    TabmixSvc.sessionManagerAddonInstalled = false;
    if (this.manager_enabled || this.crashRecovery_enabled) {
      let win = TabmixSvc.topWin();
      if (win)
        win.TMP_SessionStore.setSessionRestore(false);
      TabmixSvc.prefBranch.setBoolPref("sessions.manager", this.manager_enabled);
      TabmixSvc.prefBranch.setBoolPref("sessions.crashRecovery", this.crashRecovery_enabled);
    }
    this._notify(false);
  },
  _notify: function(isActive) {
    // in preference/session.js we only care when the preference is boolean
    let pref = "sessionManagerAddon.isActive";
    TabmixSvc.prefBranch.setBoolPref(pref, isActive);
    TabmixSvc.prefBranch.clearUserPref(pref);
  }
};

var TabmixListener = {
  onChange: function(aAddon, aAction) {
    let id = aAddon.id;
    if (id == SessionManager.id)
      SessionManager[aAction]();
    else if (id == PrivateTab.id) {
      PrivateTab[aAction]();
    }
  },
  onEnabled: function(aAddon) {
    this.onChange(aAddon, "onEnabled");
  },
  onDisabled: function(aAddon) {
    this.onChange(aAddon, "onDisabled");
  },
  onInstalled: function(aAddon) {
    if (!aAddon.isActive || aAddon.userDisabled || aAddon.appDisabled)
      return;
    this.onEnabled(aAddon);
  }
};

var TabmixAddonManager = {
  initialized: false,
  init: function() {
    if (this.initialized)
      return;
    this.initialized = true;

    SessionManager.init();
    AddonManager.addAddonListener(TabmixListener);
  }
};

TabmixAddonManager.init();
