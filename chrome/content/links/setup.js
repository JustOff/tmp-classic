/*
 * chrome://tabmixplus/content/links/setup.js
 *
 * original code by Bradley Chapman
 * modified and developped by Hemiola SUN
 * modified again by Bradley Chapman
 *
 */

/**
 * @brief Install the link-handling functions of Tab Mix Plus.
 *
 * @returns		Nothing.
 */
Tabmix.linkHandling_init = function TMP_TBP_init(aWindowType) {
  if (aWindowType == "Extension:Manager") {
      // we're in the EM
      openURL = this.openURL;
  }

  // for normal click this function calls urlbar.handleCommand
  // for middle click or click with modifiers whereToOpenLink can't be "current"
  // so we don't need to check for locked tabs only for blanks tabs
  var autoComplete = document.getElementById("PopupAutoCompleteRichResult");
  if (autoComplete) {
    this.newCode("document.getElementById('PopupAutoCompleteRichResult').onPopupClick", autoComplete.onPopupClick)._replace(
      'openUILink(url, aEvent);',
      <![CDATA[
      var isBlankTab = gBrowser.isBlankNotBusyTab(gBrowser.mCurrentTab);
      var where = isBlankTab ? "current" : whereToOpenLink(aEvent);
      var pref = "extensions.tabmix.loadUrlInBackground";
      if (this.isVersion(100))
        openUILinkIn(url, where, {inBackground: TabmixSvc.prefs.getBoolPref(pref)});
      else
        openUILinkIn(url, where, false, null, null, {backgroundPref: pref});
      ]]>
    ).toCode();
  }

  window.BrowserOpenTab = this.browserOpenTab;

  this.openUILink_init();

  // for dotCOMplete extensoin
  if ("dotCOMplete" in window)
     window.dotCOMplete.realBrowserLoadURL = this.browserLoadURL;
}

/**
 * @brief Force-call the window observer at least one time.
 *
 * @returns  Nothing.
 *
 * @Theme Vista-aero 3.0.0.91 and BlueSky 3.0.0.91 use TMP_TBP_Startup in stylesheet
 *        window[onload="TMP_TBP_Startup()"]
 */
function TMP_TBP_Startup() {
  try {
    // replace old Settings.
    // we must call this before any other tabmix function
    gTMPprefObserver.updateOldStylePrefs();
    gTMPprefObserver.updateSettings();
    gTMPprefObserver.init();
    // force-call the observer once, in order to kill new windows faster
    if (Tabmix.singleWindowMode)
      TMP_DOMWindowOpenObserver.onObserve(window, TMP_DOMWindowOpenObserver);

    // make tabmix compatible with ezsidebar extension
    var TMP_BrowserStartup = "__ezsidebar__BrowserStartup" in window ? "__ezsidebar__BrowserStartup" : "BrowserStartup";
    var bowserStartup = Tabmix.newCode("window."+TMP_BrowserStartup, window[TMP_BrowserStartup]);

    var pbs = Cc["@mozilla.org/privatebrowsing;1"].
              getService(Ci.nsIPrivateBrowsingService);
    TabmixSessionManager._inPrivateBrowsing = pbs.privateBrowsingEnabled;
    bowserStartup = bowserStartup._replace(
      'gBrowser.swapBrowsersAndCloseOther(gBrowser.selectedTab, uriToLoad);',
      <![CDATA[
       var remoteBrowser = uriToLoad.ownerDocument.defaultView.gBrowser;
       var url = remoteBrowser.getBrowserForTab(uriToLoad).currentURI.spec;
       gBrowser.tabContainer.adjustTabstrip(true, url);
       if (!Tabmix.singleWindowMode) {
         window.tabmix_afterTabduplicated = true;
         TabmixSessionManager.init();
         Tabmix.copyTabData(gBrowser.selectedTab, uriToLoad);
         $&
       }
      ]]>
    );

    var windowOpeneByTabmix = "tabmixdata" in window;
    Tabmix.isFirstWindow = Tabmix.numberOfWindows() == 1;
    Tabmix.isWindowAfterSessionRestore = TMP_SessionStore._isAfterSessionRestored();

    var firstWindow = Tabmix.isFirstWindow;
    var disAllow = TabmixSessionManager._inPrivateBrowsing || TMP_SessionStore.isSessionStoreEnabled() ||
                   Tabmix.extensions.sessionManager ||
                   Tabmix.isWindowAfterSessionRestore;
    var sessionManager = TabmixSvc.prefs.getBoolPref("extensions.tabmix.sessions.manager");
    var crashRecovery = TabmixSvc.prefs.getBoolPref("extensions.tabmix.sessions.crashRecovery");
    var afterRestart = false;

    var restoreOrAsk = TabmixSvc.prefs.getIntPref("extensions.tabmix.sessions.onStart") < 2 || afterRestart;
    var afterCrash = TabmixSvc.prefs.prefHasUserValue("extensions.tabmix.sessions.crashed");

    // don't load home page on first window if session manager or crash recovery is enabled
    if (!disAllow && ((sessionManager && windowOpeneByTabmix) ||
         (firstWindow && crashRecovery && afterCrash) ||
         (firstWindow && sessionManager && restoreOrAsk))) {
      // make sure sessionstore is init without restornig pinned tabs
      TabmixSvc.ss.init(null);

      // in firefox if we are here and gHomeButton.getHomePage() == window.arguments[0] then
      // maybe all tabs in the last session were pinned, we leet firefox to load the hompages
      bowserStartup = bowserStartup._replace(
        'uriToLoad = window.arguments[0];',
        'uriToLoad = gHomeButton.getHomePage() == window.arguments[0] ? "about:blank" : window.arguments[0];'
      );
      bowserStartup = bowserStartup._replace(
        'if (window.opener && !window.opener.closed) {',
        'if (uriToLoad && uriToLoad != "about:blank")\
           for (var i = 0; i < gBrowser.tabs.length ; i++)\
             gBrowser.tabs[i].loadOnStartup = true;\
         $&'
      );
      bowserStartup = bowserStartup._replace(
        'if (window.opener && !window.opener.closed) {',
        'if (uriToLoad == "about:blank" || "tabmixdata" in window) {\
          gBrowser.selectedBrowser.stop();\
        }\
        $&'
      );
    }
    bowserStartup.toCode();

    // call TMP_SessionStore.setService before delayedStartup, so this will run before sessionStore.init
    // At the moment we must init TabmixSessionManager before sessionStore.init
    Tabmix.newCode("delayedStartup", delayedStartup)._replace(
      '{',
      '{\
       try {\
         if (Tabmix.isFirstWindow) TMP_SessionStore.setService(1, true); \
         TabmixSessionManager.init();\
       } catch (ex) {Tabmix.assert(ex);}'
    ).toCode();

    // look for installed extensions that are incompatible with tabmix
    if (firstWindow && TabmixSvc.prefs.getBoolPref("extensions.tabmix.disableIncompatible")) {
      let checkCompatibility = function (aWindow) {
        let tmp = { };
        Components.utils.import("resource://tabmixplus/extensions/CompatibilityCheck.jsm", tmp);
        new tmp.CompatibilityCheck(aWindow, true);
      }
      window.setTimeout(checkCompatibility, 0, window);
    }

    // add tabmix menu item to tab context menu before menumanipulator and MenuEdit initialize
    TabmixContext.buildTabContextMenu();

    window[TMP_BrowserStartup]();

  } catch (ex) {Tabmix.assert(ex);}
}

// this must run before all
Tabmix.beforeStartup = function TMP_beforeStartup(tabBrowser, aTabContainer) {
    // return true if all tabs in the window are blank
    tabBrowser.isBlankWindow = function() {
       for (var i = 0; i < this.tabs.length; i++) {
          if (!this.isBlankBrowser(this.getBrowserAtIndex(i)))
             return false;
       }
       return true;
    }

    //XXX isTabEmpty exist in Firefox 4.0
    tabBrowser.isBlankTab = function(aTab) {
      return this.isBlankBrowser(this.getBrowserForTab(aTab));
    }

    if (("loadTabsProgressively" in window)) {
      tabBrowser.isBlankNotBusyTab = function TMP_isBlankNotBusyTab(aTab, aboutBlank) {
         // loadTabsProgressively add pending attribute to pending tab when it stop the tab
         if (aTab.hasAttribute("busy") || aTab.hasAttribute("pending"))
            return false;

         return this.isBlankBrowser(this.getBrowserForTab(aTab), aboutBlank);
      }
    }
    else {
      tabBrowser.isBlankNotBusyTab = function TMP_isBlankNotBusyTab(aTab, aboutBlank) {
         if (aTab.hasAttribute("busy"))
            return false;

         return this.isBlankBrowser(this.getBrowserForTab(aTab), aboutBlank);
      }
    }

    tabBrowser.isBlankBrowser = function TMP_isBlankBrowser(aBrowser, aboutBlank) {
       try{
          if (!aBrowser)
             return true;
          return (!aBrowser.sessionHistory || aBrowser.sessionHistory.index < 0 ||
                  (aBrowser.sessionHistory.count < 2 &&
                  (!aBrowser.currentURI ||
                  (aboutBlank ? aBrowser.currentURI.spec == "about:blank" : Tabmix.isNewTabUrls(aBrowser.currentURI.spec))
          )));
       } catch (ex) {Tabmix.assert(ex); return true;}
    }

    tabBrowser.getTabForBrowser = function (aBrowser) {
      return this._getTabForContentWindow(aBrowser.contentWindow);
    }

    tabBrowser.getTabForLastPanel = function () {
       return this._getTabForContentWindow(this.mPanelContainer.lastChild.firstChild.firstChild.contentWindow);
    }

    var tabContainer = aTabContainer || tabBrowser.mTabContainer ||
                       document.getAnonymousElementByAttribute(tabBrowser, "anonid", "tabcontainer");

    TMP_eventListener.init(tabContainer);

    // Firefox sessionStore and session manager extension start to add tab before our onWindowOpen run
    // so we initialize this before start
    // mTabMaxWidth not exist from firefox 4.0
    var max = Math.max(16, this.getIntPref("browser.tabs.tabMaxWidth", 250));
    var min = Math.max(16, TabmixSvc.prefs.getIntPref("browser.tabs.tabMinWidth"));
    if (max < min) {
      TabmixSvc.prefs.setIntPref("browser.tabs.tabMaxWidth", min);
      TabmixSvc.prefs.setIntPref("browser.tabs.tabMinWidth", max);
      [min, max] = [max, min];
    }
    tabContainer.mTabMaxWidth = max;
    tabContainer.mTabMinWidth = min;
    TabmixTabbar.widthFitTitle = TabmixSvc.TMPprefs.getBoolPref("flexTabs") && (max != min);
    this.setItem(tabContainer, "widthFitTitle", TabmixTabbar.widthFitTitle || null);

    var tabscroll = TabmixSvc.prefs.getIntPref("extensions.tabmix.tabBarMode");
    if (tabscroll < 0 || tabscroll > 3 ||
        (tabscroll != TabmixTabbar.SCROLL_BUTTONS_LEFT_RIGHT && "TreeStyleTabBrowser" in window)) {
      TabmixSvc.prefs.setIntPref("extensions.tabmix.tabBarMode", 1);
      tabscroll = 1;
    }
    TabmixTabbar.scrollButtonsMode = tabscroll;
    TabmixTabbar.isMultiRow = tabscroll == TabmixTabbar.SCROLL_BUTTONS_MULTIROW;

    // add flag that we are after SwitchThemes, we use it in Tabmix.isWindowAfterSessionRestore
    if ("SwitchThemesModule" in window && SwitchThemesModule.windowsStates && SwitchThemesModule.windowsStates.length)
      TMP_SessionStore.afterSwitchThemes = true;
}
