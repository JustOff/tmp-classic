"use strict";

// code based on Tab X 0.5 enhanced version by Morac, modified by Hemiola SUN, later CPU & onemen
var TabmixTabbar = {
  visibleRows: 1,
  _windowStyle: {exist:false, value:null},
  _heights: [],
  _rowHeight: null,
  hideMode: 0,
  position: 0,
  SCROLL_BUTTONS_HIDDEN: 0,
  SCROLL_BUTTONS_LEFT_RIGHT: 1,
  SCROLL_BUTTONS_MULTIROW: 2,
  SCROLL_BUTTONS_RIGHT: 3,

  get isMultiRow() {
    return gBrowser.tabContainer.getAttribute("flowing") == "multibar";
  },

  updateSettings: function TMP_updateSettings(start) {
    if (!gBrowser || Tabmix.prefs.prefHasUserValue("setDefault"))
      return;

    var tabBar = gBrowser.tabContainer;
    var tabStrip = tabBar.mTabstrip;

    var tabscroll = Tabmix.prefs.getIntPref("tabBarMode");
    if (document.documentElement.getAttribute("chromehidden").indexOf("toolbar") != -1)
      tabscroll = 1;

    if (tabscroll < 0 || tabscroll > 3 ||
        (tabscroll != this.SCROLL_BUTTONS_LEFT_RIGHT &&
        Tabmix.extensions.verticalTabBar)) {
      Tabmix.prefs.setIntPref("tabBarMode", 1);
      return;
    }
    var prevTabscroll = start ? -1 : this.scrollButtonsMode;
    this.scrollButtonsMode = tabscroll;
    var isMultiRow = tabscroll == this.SCROLL_BUTTONS_MULTIROW;

    var currentVisible = start ? true : tabStrip.isElementVisible(gBrowser.mCurrentTab);

    if (prevTabscroll != tabscroll) {
      // update pointer to the button object that we are going to use
      let useTabmixButtons = tabscroll > this.SCROLL_BUTTONS_LEFT_RIGHT;
      let overflow = tabBar.overflow;

      switch (tabscroll) {
        case this.SCROLL_BUTTONS_HIDDEN:
          tabBar.setAttribute("flowing", "singlebar");
          break;
        case this.SCROLL_BUTTONS_LEFT_RIGHT:
          tabBar.setAttribute("defaultScrollButtons", true);
          Tabmix.setItem("tabmixScrollBox", "defaultScrollButtons", true);
        case this.SCROLL_BUTTONS_RIGHT:
          tabBar.setAttribute("flowing", "scrollbutton");
          break;
        case this.SCROLL_BUTTONS_MULTIROW:
          tabBar.setAttribute("flowing", "multibar");
          break;
      }

      // from Firefox 4.0+ on we add dynamicly scroll buttons on TabsToolbar.
      this.setScrollButtonBox(useTabmixButtons, false, true);
      if (isMultiRow || prevTabscroll == this.SCROLL_BUTTONS_MULTIROW) {
        // temporarily hide vertical scroll button.
        // visible button can interfere with row height calculation.
        // remove the collapsed attribut after updateVerticalTabStrip
        Tabmix.setItem("tabmixScrollBox", "collapsed", true);
      }

      let flowing = tabBar.getAttribute("flowing");
      tabStrip.setAttribute("flowing", flowing);
      Tabmix.setItem("tabmixScrollBox", "flowing", flowing);

      if (prevTabscroll == this.SCROLL_BUTTONS_MULTIROW) {
        tabBar.resetFirstTabInRow();
        tabBar.updateVerticalTabStrip(true);
      }
      else if (isMultiRow && overflow) {
        // if we are in overflow in one line we will have more then one line
        // in multi-row. we try to prevent extra over/underflow events by setting
        // the height in front.
        tabStrip.orient = "vertical";
        if (tabBar.updateVerticalTabStrip() == "scrollbar")
          tabBar.overflow = true;
      }
      Tabmix.setItem("tabmixScrollBox", "collapsed", null);

      tabBar._positionPinnedTabs();
      if (Tabmix.isVersion(170) && isMultiRow && TMP_tabDNDObserver.paddingLeft)
        TMP_tabDNDObserver.paddingLeft = Tabmix.getStyle(tabBar, "paddingLeft");

      if (tabscroll != this.SCROLL_BUTTONS_LEFT_RIGHT &&
            tabBar.hasAttribute("defaultScrollButtons")) {
        tabBar.removeAttribute("defaultScrollButtons");
        Tabmix.setItem("tabmixScrollBox", "defaultScrollButtons", null);
      }
    }

    this.widthFitTitle = Tabmix.prefs.getBoolPref("flexTabs") &&
                    (tabBar.mTabMaxWidth != tabBar.mTabMinWidth);
    if (!Tabmix.extensions.verticalTabBar) {
      if (start) {
        // Don't change tabstip orient on start before sessionStore ends.
        // if we set orient to vertical before sessionStore finish
        // sessionStore don't select the selected tab from last session.
        setTimeout(function() {tabBar.setTabStripOrient();}, 0);
      }
      else
        tabBar.setTabStripOrient();
    }
    Tabmix.setItem(tabBar, "widthFitTitle", this.widthFitTitle || null);

    if (Tabmix.prefs.getIntPref("tabs.closeButtons") == 5 && this.widthFitTitle)
      Tabmix.prefs.setIntPref("tabs.closeButtons", 1);

    // fix bug in positioning the popup off screen or on the button when window is not maximize or when tab bar is in the bottom
    Tabmix.setItem("alltabs-popup", "position",
           (window.windowState != window.STATE_MAXIMIZED || this.position == 1) ? "start_before" : "after_end");

    // for light weight themes
    Tabmix.setItem("main-window", "tabmix_lwt", isMultiRow || this.position == 1 || null);

    for (let i = 0; i < tabBar.childNodes.length; i++) {
      let aTab = tabBar.childNodes[i];
      // treeStyleTab code come after SessionManager... look in extensions.js
      TabmixSessionManager.updateTabProp(aTab);
    }

    if (tabBar.mCloseButtons == 5)
      tabBar.adjustTabstrip(true);

    // show on tabbar
    var showNewTabButton = Tabmix.prefs.getBoolPref("newTabButton");
    let toolBar = gBrowser.tabContainer._container;
    let tabstripClosebutton = document.getElementById("tabs-closebutton");
    if (tabstripClosebutton && tabstripClosebutton.parentNode == toolBar)
      tabstripClosebutton.collapsed = Tabmix.prefs.getBoolPref("hideTabBarButton");
    let allTabsButton = document.getElementById("alltabs-button");
    if (allTabsButton && allTabsButton.parentNode == toolBar)
      allTabsButton.collapsed = Tabmix.prefs.getBoolPref("hideAllTabsButton");

    let newTabButton = document.getElementById("new-tab-button");
    showNewTabButton =  showNewTabButton && newTabButton && newTabButton.parentNode == toolBar;
    Tabmix.setItem("TabsToolbar", "newTabButton", showNewTabButton || false);
    Tabmix.setItem(tabBar, "tabBarSpace", Tabmix.prefs.getBoolPref("tabBarSpace") || null);
    tabBar._checkNewtabButtonVisibility = isMultiRow && showNewTabButton && Tabmix.prefs.getIntPref("newTabButton.position") == 2;

    var self = this;
    if (start)
      window.setTimeout(function TMP_updateSettings_onstart() {self.updateScrollStatus();}, 0);
    else
      this.updateScrollStatus();

    window.setTimeout( function TMP_updateSettings_adjustScroll(_currentVisible) {
        if (_currentVisible)
          gBrowser.ensureTabIsVisible(gBrowser.selectedTab);
        self.updateBeforeAndAfter();
    }, 50, currentVisible);
  },

  setScrollButtonBox: function TMP_setScrollButtonBox(useTabmixButtons, insertAfterTabs, update) {
    let newBox, box = document.getElementById("tabmixScrollBox");
    if (useTabmixButtons && !box) {
      newBox = true;
      box = document.createElement("box");
      box.setAttribute("class", "tabbrowser-arrowscrollbox tabmix_scrollbuttons_box");
      box.setAttribute("type", "tabmix-box");
      box.setAttribute("id", "tabmixScrollBox");
    }

    let tabStrip  = gBrowser.tabContainer.mTabstrip;
    if (newBox || (useTabmixButtons && insertAfterTabs)) {
      let tabsToolbar = document.getElementById("TabsToolbar");
      let cSet = tabsToolbar.getAttribute("currentset") || tabsToolbar.getAttribute("defaultset");
      // remove existing tabmixScrollBox item
      cSet = cSet.replace("tabmixScrollBox", "").replace(",,", ",").split(",");
      let index = cSet.indexOf("tabbrowser-tabs");
      cSet.splice(index + 1, 0, "tabmixScrollBox");
      tabsToolbar.setAttribute("currentset", cSet.join(","));
///XXX check if we can do it only on first oveflow
      tabsToolbar.insertBefore(box, gBrowser.tabContainer.nextSibling);
      tabStrip._scrollButtonDownRight = box._scrollButtonDown;
      tabStrip._scrollButtonUpRight = box._scrollButtonUp;
    }
    if (update) {
      if (useTabmixButtons) {
        // we have to set orient attribute for Linux theme
        // maybe other themes need it for display the scroll arrow
        box.orient = this.isMultiRow ? "vertical" : "horizontal";
      }

      tabStrip._scrollButtonDown = !useTabmixButtons ?
          tabStrip._scrollButtonDownLeft : tabStrip._scrollButtonDownRight;
      gBrowser.tabContainer._animateElement = tabStrip._scrollButtonDown;

      tabStrip._scrollButtonUp = !useTabmixButtons ?
          tabStrip._scrollButtonUpLeft : tabStrip._scrollButtonUpRight;
      tabStrip._updateScrollButtonsDisabledState();
      tabStrip._scrollButtonUp.collapsed = !gBrowser.tabContainer.overflow;
      tabStrip._scrollButtonDown.collapsed = !gBrowser.tabContainer.overflow;
    }
  },

  updateScrollStatus: function TMP_updateScrollStatus() {
    var tabBar = gBrowser.tabContainer;
    if (this.isMultiRow && tabBar.mTabstrip.orient == "vertical") {
      //XXX we only need setFirstTabInRow from here when tab width changed
      // so if widthFitTitle is false we need to call it if we actualy change the width
      // for other chases we need to call it when we change title
      tabBar.setFirstTabInRow();
      tabBar.updateVerticalTabStrip();
    }
    else if (!this.isMultiRow)
      tabBar.adjustNewtabButtonvisibility();
  },

  // in Firefox 4.0+ rowheight can change when TabsInTitlebar or TabsOnTop
  _tabsPosition: "tabsonbottom",
  getTabsPosition: function TMP_getTabsPosition() {
    let tabsPosition, docElement = document.documentElement;
    if (docElement.getAttribute("tabsintitlebar") == "true")
      tabsPosition = "tabsintitlebar";
    else if (docElement.getAttribute("tabsontop") == "true")
      tabsPosition = "tabsontop";
    else
      tabsPosition = "tabsonbottom";
    return tabsPosition;
  },

  get singleRowHeight() {
    let heights = this._heights[this._tabsPosition];
    if (typeof(heights) == "undefined")
      return gBrowser.tabContainer.tabstripInnerbox.getBoundingClientRect().height;
    return heights[2] / 2;
  },

  setHeight: function TMP_setHeight(aRows, aReset) {
    // don't do anything when the tabbar is hidden
    // by Print preview or others...
    if (gInPrintPreviewMode || !gBrowser.tabContainer.visible ||
        FullScreen._isChromeCollapsed)
      return;

    var tabsPosition = this.getTabsPosition();
    // need to reset height
    if (this._tabsPosition != tabsPosition) {
      aReset = true;
    }

    if (!aReset && this.visibleRows == aRows)
      return;

    this.visibleRows = aRows;
    this._tabsPosition = tabsPosition;
    var tabBar = gBrowser.tabContainer;
    var tabstrip = tabBar.mTabstrip._scrollbox;

    if (aRows == 1 || aReset)
      this.resetHeight();
    if (aRows == 1) {
      Tabmix.setItem(tabBar, "multibar", null);
      Tabmix.setItem("TabsToolbar", "multibar", null);
      tabBar.overflow = false;
      return;
    }

    var newHeight, fillRowsHeights;
    if (typeof(this._heights[tabsPosition]) == "undefined") {
      this._heights[tabsPosition] = { };
      fillRowsHeights = true;
    }
    if (aRows in this._heights[tabsPosition])
      newHeight = this._heights[tabsPosition][aRows];
    else {
      if (tabBar.tabstripInnerbox) {
        let height = tabBar.tabstripInnerbox.getBoundingClientRect().height;
        if (tabBar.getAttribute("multibar") == "scrollbar") {
          // We can get here if we switch to diffrent tabs position while in multibar
          let rowHeight = height/tabBar.lastTabRowNumber;
          newHeight = rowHeight * aRows;
        }
        else
          newHeight = height;
      }
      else
        newHeight = this.getRowHeight(tabsPosition) * aRows;

      this._heights[tabsPosition][aRows] = newHeight;
      if (fillRowsHeights || (aRows > 2 && typeof(this._heights[tabsPosition][aRows-1]) == "undefined")) {
        let rowHeight = newHeight / aRows;
        for (let row = 2; row < aRows; row++)
          this._heights[tabsPosition][row] = rowHeight * row;
      }
    }

    if (tabstrip.style.maxHeight != tabstrip.style.height || tabstrip.style.maxHeight != newHeight + "px")
      this.setHeightByPixels(newHeight);
  },

  setHeightByPixels: function TMP_setHeightByPixels(newHeight) {
    var tabBar = gBrowser.tabContainer;
    var tabstrip = tabBar.mTabstrip._scrollbox;
    tabstrip.style.setProperty("max-height",newHeight + "px", "important");
    tabstrip.style.setProperty("height",newHeight + "px", "important");
    let tabsBottom = document.getAnonymousElementByAttribute(tabBar, "class", "tabs-bottom");
    let tabsBottomHeight = tabsBottom && tabBar.getAttribute("classic") != "v3Linux" ? tabsBottom.boxObject.height : 0;
    let newTabbarHeight = newHeight + tabsBottomHeight;
    if (Tabmix.isMac) {
      document.getElementById("TabsToolbar").style.setProperty("height",newTabbarHeight + "px", "important");
    }
    // override fixed height set by theme to .tabbrowser-tabs class
    if (tabBar.boxObject.height < newTabbarHeight || tabBar.style.getPropertyValue("height")) {
      tabBar.style.setProperty("max-height",newTabbarHeight + "px", "important");
      tabBar.style.setProperty("height",newTabbarHeight + "px", "important");
    }
    let tabsToolbar = document.getElementById("TabsToolbar");
    if (tabsToolbar.boxObject.height < newTabbarHeight || tabsToolbar.style.getPropertyValue("height")) {
      tabsToolbar.style.setProperty("max-height",newTabbarHeight + "px", "important");
      tabsToolbar.style.setProperty("height",newTabbarHeight + "px", "important");
    }

    // experimental - for theme that put tababr above the menus
    // curently its only work with Vfox3 theme
    if (tabstrip.boxObject.y <= gNavToolbox.boxObject.y) {
      let skin = Services.prefs.getCharPref("general.skins.selectedSkin");
      let themes = /^(Vfox3)/;
      if (themes.test(skin)) {
        let mWin = document.getElementById("main-window");
        if (!this._windowStyle.exist) {
          this._windowStyle.exist = true;
          this._windowStyle.value = mWin.hasAttribute("style") ? mWin.getAttribute("style") : null;
        }
        mWin.style.setProperty("padding-top", newTabbarHeight + "px", "important");
      }
    }
    gTMPprefObserver.updateTabbarBottomPosition();
  },

  resetHeight: function TMP_resetHeight() {
    var tabBar = gBrowser.tabContainer;
    var tabstrip = tabBar.mTabstrip._scrollbox;
    let tabsToolbar = document.getElementById("TabsToolbar");
    if (tabsToolbar.hasAttribute("style")) {
      tabsToolbar.style.removeProperty("max-height");
      tabsToolbar.style.removeProperty("height");
    }
    if (tabstrip.hasAttribute("style")) {
      tabstrip.style.removeProperty("max-height");
      tabstrip.style.removeProperty("height");
    }
    if (tabBar.hasAttribute("style")) {
      tabBar.style.removeProperty("max-height");
      tabBar.style.removeProperty("height");
    }
    if (this._windowStyle.exist)
      Tabmix.setItem(document.getElementById("main-window"), "style", this._windowStyle.value);
    if (Tabmix.isMac) {
      document.getElementById("TabsToolbar").style.removeProperty("height");
    }
    gTMPprefObserver.updateTabbarBottomPosition();
  },

  _handleResize: function TMP__handleResize() {
    var tabBar = gBrowser.tabContainer;
    if (this.isMultiRow) {
      tabBar.setFirstTabInRow();
      if (tabBar.mTabstrip.orient != "vertical")
        tabBar.mTabstrip._enterVerticalMode();
      else
        tabBar.updateVerticalTabStrip();

      if (this.position == 1)
        setTimeout(function(){tabBar.updateVerticalTabStrip();},0);
    }
    ///maybe we cad add this to the popupshing / or as css rule ?
    Tabmix.setItem("alltabs-popup", "position",
        (window.windowState != window.STATE_MAXIMIZED || this.position == 1) ? "start_before" : "after_end");
  },

  // Update beforeselected and afterselected attribute when we are in multi-row mode
  updateBeforeAndAfter: function TMP_updateBeforeAndAfter() {
    var tabBar = gBrowser.tabContainer;
    if (!tabBar.hasAttribute("multibar"))
       return;

    var top = tabBar.topTabY;
    var tab = tabBar.selectedItem, tabRow = tabBar.getTabRowNumber(tab, top);
    var prev = TMP_TabView.previousVisibleSibling(tab), next = TMP_TabView.nextVisibleSibling(tab);
    if (prev && prev.localName == "tab") {
      Tabmix.setItem(prev, "beforeselected", tabRow == tabBar.getTabRowNumber(prev, top) ? true : null);
    }
    if (next && next.localName == "tab") {
      Tabmix.setItem(next, "afterselected", tabRow == tabBar.getTabRowNumber(next, top) ? true : null);
    }
  },

  getRowHeight: function TMP_getRowHeight(tabsPosition) {
    if (this._rowHeight && this._rowHeight[tabsPosition])
      return this._rowHeight[tabsPosition];

    var tabBar = gBrowser.tabContainer;
    var tabs = gBrowser.visibleTabs;

    var firstTab = tabs[0];
    var lastTab = tabBar.visibleTabsLastChild;
    var top = tabBar.topTabY;
    var lastTabRow = tabBar.lastTabRowNumber;
    if (lastTabRow == 1) { // one row
      if (firstTab.getAttribute("selected") == "true")
        return lastTab.boxObject.height;
      else
        return firstTab.boxObject.height;
    }
    else if (lastTabRow == 2) { // multi-row
      let newRowHeight;
      if (lastTab.getAttribute("selected") == "true") {
        // check if previous to last tab in the 1st row
        // this happen when the selected tab is the first tab in the 2nd row
        var prev = TMP_TabView.previousVisibleSibling(lastTab);
        if (prev && tabBar.getTabRowNumber(prev, top) == 1)
          return lastTab.boxObject.height;
        else
          newRowHeight = prev.baseY - firstTab.baseY;
      }
      else if (firstTab.getAttribute("selected") == "true") {
        // check if 2nd visible tab is in the 2nd row
        // (not likely that user set tab width to more then half screen width)
        var next = TMP_TabView.nextVisibleSibling(firstTab);
        if (next && tabBar.getTabRowNumber(next, top) == 2)
          return lastTab.boxObject.height;
        else
          newRowHeight = lastTab.baseY - next.baseY;
      }
      else
        newRowHeight = lastTab.baseY - firstTab.baseY;

      this._rowHeight[tabsPosition] = newRowHeight;
      return newRowHeight;
    }

    // Just in case we missed something in the above code............
    var i, j;
    i = j = tabs[0]._tPos;
    if ( tabs[j] && tabs[j].getAttribute("selected") == "true" )
      j++;
    while (this.inSameRow(tabs.item(i), tabs.item(j)))
      i++;

    if ( !tabs[i] ) // only one row
      if ( tabs[j] )
        return tabs[j].boxObject.height;
      else
        return tabs[0].boxObject.height;

    if ( tabs[i].getAttribute("selected") == "true" )
      i++;
    if ( !tabs[i] )
      return tabs[i-1].boxObject.height;

    this._rowHeight[tabsPosition] = tabs[i].baseY - tabs[j].baseY;
    return this._rowHeight[tabsPosition];
  },

  inSameRow: function TMP_inSameRow(tab1, tab2) {
    if ( !tab1 || !tab2 )
      return false;

    var tabBar = gBrowser.tabContainer;
    var top = tabBar.topTabY;
    return tabBar.getTabRowNumber(tab1, top) == tabBar.getTabRowNumber(tab2, top);
  }

} // TabmixTabbar end

// Function to catch changes to Tab Mix preferences and update existing windows and tabs
//
var gTMPprefObserver = {
  preventUpdate: false,
  init: function() {
    Tabmix.prefs.clearUserPref("setDefault");
    Tabmix.prefs.clearUserPref("PrefObserver.error")

    let addObserver = function(pref, condition) {
      if (condition)
        this.OBSERVING.push(pref);
    }.bind(this);
    addObserver("browser.tabs.onTop",     Tabmix.isVersion(120));
    addObserver("browser.newtab.url",    !Tabmix.isVersion(130));
    addObserver("browser.warnOnRestart", !Tabmix.isVersion(200));
    addObserver("browser.tabs.autoHide", !Tabmix.isVersion(230));

    try {
      // add Observer
      for (var i = 0; i < this.OBSERVING.length; ++i)
        Services.prefs.addObserver(this.OBSERVING[i], this, false);
    }
    catch(e) {
      Tabmix.log("prefs-Observer failed to attach:" + "\n" + e);
      Tabmix.prefs.setBoolPref("PrefObserver.error", true);
    }
  },

  OBSERVING: ["extensions.tabmix.",
              "browser.tabs.closeButtons",
              "browser.tabs.tabMinWidth",
              "browser.tabs.tabMaxWidth",
              "browser.tabs.tabClipWidth",
              "browser.sessionstore.max_tabs_undo",
              "browser.warnOnQuit",
              "browser.sessionstore.resume_from_crash",
              "browser.startup.page",
              "browser.link.open_newwindow.override.external",
              "browser.link.open_newwindow.restriction",
              "browser.link.open_newwindow",
              "browser.ctrlTab.previews"],

  // removes the observer-object from service -- called when the window is no longer open
  removeObservers: function() {
    let prefSvc = Services.prefs;
    for (var i = 0; i < this.OBSERVING.length; ++i)
      prefSvc.removeObserver(this.OBSERVING[i], this);
  },

 /**
  * Observer-function
  * subject: [wrapped nsISupports :: nsIPrefBranch], nsIPrefBranch Internal
  * topic: "changed"
  */
  observe: function TMP_pref_observer(subject, topic, prefName) {
    if (this.preventUpdate)
      return;
    // if we don't have a valid window (closed)
    if ( !(typeof(document) == 'object' && document) ) {
      this.removeObservers(); // remove the observer..
      return;  // ..and don't continue
    }

    var prefValue, value;
    switch (prefName) {
      case "extensions.tabmix.titlefrombookmark":
        TMP_Places.onPreferencChanged(Services.prefs.getBoolPref(prefName));
        break;
      case "extensions.tabmix.dblClickTabbar_changesize":
        document.getElementById("TabsToolbar")._dragBindingAlive = Services.prefs.getBoolPref(prefName);
        break;
      case "extensions.tabmix.lockallTabs":
        TabmixTabbar.lockallTabs = Services.prefs.getBoolPref(prefName);
      case "extensions.tabmix.lockAppTabs":
        if (!Tabmix.prefs.getBoolPref("updateOpenedTabsLockState"))
          break;
        let updatePinned = prefName == "extensions.tabmix.lockAppTabs";
        let lockAppTabs = Tabmix.prefs.getBoolPref("lockAppTabs")
        for (let i = 0; i < gBrowser.tabs.length; i++) {
          let tab = gBrowser.tabs[i];
          if (tab.pinned != updatePinned)
            continue; // only update for the appropriate tabs type
          // when user change settings to lock all tabs we always lock all tabs
          // regardless if they were lock and unlocked before by the user
          if (updatePinned ? lockAppTabs : TabmixTabbar.lockallTabs) {
            tab.setAttribute("locked", "true");
          }
          else {
            tab.removeAttribute("locked");
          }
          if (updatePinned) {
            tab.removeAttribute("_lockedAppTabs");
            tab.setAttribute("_locked", tab.hasAttribute("locked"));
          }
          else
            tab.removeAttribute("_locked");
          tab.linkedBrowser.tabmix_allowLoad = !tab.hasAttribute("locked");
        }
        break;
      case "extensions.tabmix.extraIcons.autoreload":
        Tabmix.setItem(gBrowser.tabContainer, "extraIcons-autoreload", Services.prefs.getBoolPref(prefName) || null);
        break;
      case "extensions.tabmix.extraIcons.protected":
        Tabmix.setItem(gBrowser.tabContainer, "extraIcons-protected", Services.prefs.getBoolPref(prefName) || null);
        break;
      case "extensions.tabmix.extraIcons.locked":
        Tabmix.setItem(gBrowser.tabContainer, "extraIcons-locked", Services.prefs.getBoolPref(prefName) || null);
        break;
      case "extensions.tabmix.dblClickTab":
      case "extensions.tabmix.middleClickTab":
      case "extensions.tabmix.ctrlClickTab":
      case "extensions.tabmix.shiftClickTab":
      case "extensions.tabmix.altClickTab":
      case "extensions.tabmix.dblClickTabbar":
      case "extensions.tabmix.middleClickTabbar":
      case "extensions.tabmix.ctrlClickTabbar":
      case "extensions.tabmix.shiftClickTabbar":
      case "extensions.tabmix.altClickTabbar":
        this.blockTabClickingOptions(prefName);
        break;
      case "extensions.tabmix.undoCloseButton.menuonly":
        TMP_ClosedTabs.setButtonType(Services.prefs.getBoolPref(prefName));
        break;
      case "extensions.tabmix.focusTab":
          Services.prefs.setBoolPref("browser.tabs.selectOwnerOnClose", Services.prefs.getIntPref(prefName) == 2);
        break;
      case "extensions.tabmix.hideIcons":
        this.setMenuIcons();
        break;
      // tab appearnce
      case "extensions.tabmix.currentTab":
      case "extensions.tabmix.unloadedTab":
      case "extensions.tabmix.unreadTab":
      case "extensions.tabmix.otherTab":
        this.toggleTabStyles(prefName);
        break;
      case "extensions.tabmix.styles.currentTab":
      case "extensions.tabmix.styles.unloadedTab":
      case "extensions.tabmix.styles.unreadTab":
      case "extensions.tabmix.styles.otherTab":
      case "extensions.tabmix.styles.progressMeter":
        this.setTabStyles(prefName);
        break;
      case "extensions.tabmix.progressMeter":
        this.setProgressMeter();
        break;
      case "browser.tabs.tabMaxWidth":
      case "browser.tabs.tabMinWidth":
        var tabStrip = gBrowser.tabContainer.mTabstrip;
        var currentVisible = tabStrip.isElementVisible(gBrowser.mCurrentTab);
        let tabMaxWidth = Math.max(16, Services.prefs.getIntPref("browser.tabs.tabMaxWidth"));
        let tabMinWidth = Math.max(16, Services.prefs.getIntPref("browser.tabs.tabMinWidth"));
        if (tabMaxWidth < tabMinWidth) {
          if (prefName == "browser.tabs.tabMaxWidth")
            tabMaxWidth = tabMinWidth;
          else
            tabMinWidth = tabMaxWidth;
        }
        gBrowser.tabContainer.mTabMaxWidth = tabMaxWidth;
        gBrowser.tabContainer.mTabMinWidth = tabMinWidth;
        this.dynamicRules["width"].style.setProperty("max-width", tabMaxWidth + "px", "important");
        this.dynamicRules["width"].style.setProperty("min-width", tabMinWidth + "px", "important");
        // fix bug in classiccompact
        if (typeof classiccompactoptions == "object" &&
            Services.prefs.getCharPref("general.skins.selectedSkin") == "classiccompact") {
          classiccompactoptions.setTabWidths(document);
        }
        TabmixTabbar.updateSettings(false);
        // we need this timeout when there are many tabs
        if (typeof this._tabWidthChanged == "undefined") {
          let self = this;
          this._tabWidthChanged = true;
          [50, 100, 250, 500].forEach(function (timeout) {
            setTimeout(function TMP_tabWidthChanged() {
              if (currentVisible)
                gBrowser.ensureTabIsVisible(gBrowser.selectedTab);
              TabmixTabbar.updateScrollStatus();
              if (timeout == 500)
                delete self._tabWidthChanged;
            }, timeout);
          });
        }
        break;
      case "browser.tabs.tabClipWidth":
        gBrowser.tabContainer.mTabClipWidth = Services.prefs.getIntPref(prefName);
        gBrowser.tabContainer.adjustTabstrip();
        break;
      case "extensions.tabmix.keepLastTab":
        gBrowser.tabContainer._keepLastTab = Services.prefs.getBoolPref(prefName);
        gBrowser.tabContainer.adjustTabstrip();
        break;
      case "browser.tabs.closeButtons":
        value = Services.prefs.getIntPref(prefName);
        switch (value) {
          case 0: // Display a close button on the active tab only
            Tabmix.prefs.setIntPref("tabs.closeButtons", 3);
            break;
          case 1: // Display close buttons on all tabs (Default)
            Tabmix.prefs.setIntPref("tabs.closeButtons", 1);
            break;
          case 2: // Don�t display any close buttons
            break;
          case 3: // Display a single close button at the end of the tab strip
            break;
          default: // invalid value.... don't do anything
            return;
        }
        // show/hide close button on tabs
        Tabmix.prefs.setBoolPref("tabs.closeButtons.enable", value < 2);
        // show/hide close button on the tabbar
        Tabmix.prefs.setBoolPref("hideTabBarButton", value != 3);
        break;
      case "extensions.tabmix.tabs.closeButtons":
        value = Services.prefs.getIntPref(prefName);
        if (value < 1 || value > 5) {
          Services.prefs.setIntPref(prefName, 1);
        }
        else if (value == 5 && TabmixTabbar.widthFitTitle)
          Services.prefs.setIntPref(prefName, 1);
        else {
          gBrowser.tabContainer.mCloseButtons = Services.prefs.getIntPref(prefName);
          gBrowser.tabContainer.adjustTabstrip();
        }
        break;
      case "extensions.tabmix.tabs.closeButtons.onLeft":
        gBrowser.tabContainer.setAttribute("closebuttons-side", Services.prefs.getBoolPref(prefName) ? "left" : "right");
        break;
      case "extensions.tabmix.tabs.closeButtons.enable":
        prefValue = Services.prefs.getBoolPref(prefName)
        gBrowser.tabContainer.closeButtonsEnabled = prefValue;
        gBrowser.tabContainer.mTabstrip.offsetRatio = prefValue ? 0.70 : 0.50;
        gBrowser.tabContainer.adjustTabstrip();
        break;
      case "extensions.tabmix.tabBarPosition":
         if (this.tabBarPositionChanged(Services.prefs.getIntPref(prefName))) {
           if (window.fullScreen) {
             TMP_eventListener.onFullScreen(true);
             if (TabmixTabbar.position == 1)
               TMP_eventListener.mouseoverToggle(false);
           }
           TabmixTabbar.updateSettings(false);
         }
        break;
      case "extensions.tabmix.undoClose":
        if (!Tabmix.prefs.getBoolPref("undoClose")) {
          Services.prefs.setIntPref("browser.sessionstore.max_tabs_undo", 0);
        }
        else if (Services.prefs.getIntPref("browser.sessionstore.max_tabs_undo") == 0)
          Services.prefs.clearUserPref("browser.sessionstore.max_tabs_undo");
        break;
      case "browser.sessionstore.max_tabs_undo":
        // Firefox's sessionStore mainain the right amount
        prefValue = Services.prefs.getIntPref(prefName);
        if (Tabmix.prefs.getBoolPref("undoClose") != (prefValue > 0))
          Tabmix.prefs.setBoolPref("undoClose", prefValue > 0);
        TMP_ClosedTabs.setButtonDisableState();
        break;
      case "browser.warnOnRestart":
      case "browser.warnOnQuit":
      case "browser.sessionstore.resume_from_crash":
        if (!Services.prefs.getBoolPref(prefName))
          return;

        var TMP_sessionManager_enabled = Tabmix.prefs.getBoolPref("sessions.manager") ||
                         Tabmix.prefs.getBoolPref("sessions.crashRecovery");
        if (TMP_sessionManager_enabled)
          Services.prefs.setBoolPref(prefName, false);
        break;
      case "browser.startup.page":
        if (Services.prefs.getIntPref(prefName) != 3)
          return;
        TMP_sessionManager_enabled = Tabmix.prefs.getBoolPref("sessions.manager") ||
                         Tabmix.prefs.getBoolPref("sessions.crashRecovery");

        if (TMP_sessionManager_enabled)
          Services.prefs.setIntPref(prefName, 1);
        break;
      case "extensions.tabmix.sessions.manager":
      case "extensions.tabmix.sessions.crashRecovery":
        TMP_SessionStore.setService(2, false);
      case "extensions.tabmix.sessions.save.closedtabs":
      case "extensions.tabmix.sessions.save.history":
      case "extensions.tabmix.sessionToolsMenu":
      case "extensions.tabmix.closedWinToolsMenu":
        TabmixSessionManager.updateSettings();
        break;
      case "extensions.tabmix.sessions.save.permissions":
        for (let i = 0; i < gBrowser.tabs.length; i++)
          TabmixSessionManager.updateTabProp(gBrowser.tabs[i]);
        break;
      case "extensions.tabmix.optionsToolMenu":
        document.getElementById("tabmix-menu").hidden = !Services.prefs.getBoolPref(prefName);
        break;
      case "browser.link.open_newwindow.override.external":
      case "browser.link.open_newwindow.restriction":
      case "browser.link.open_newwindow":
        this.setLink_openPrefs();
        break;
      case "extensions.tabmix.singleWindow":
        this.setSingleWindowUI();
        break;
      case "extensions.tabmix.hideTabbar":
        this.setAutoHidePref();
        this.setTabBarVisibility(false);
        break;
      case "browser.tabs.autoHide":
        this.setAutoHidePref();
        break;
      case "extensions.tabmix.newTabButton.position":
        this.changeNewTabButtonSide(Services.prefs.getIntPref(prefName));
        break;
      case "browser.ctrlTab.previews":
      case "extensions.tabmix.lasttab.tabPreviews":
      case "extensions.tabmix.lasttab.respondToMouseInTabList":
      case "extensions.tabmix.lasttab.showTabList":
        TMP_LastTab.ReadPreferences();
        break;
      case "extensions.tabmix.reloadEvery.onReloadButton":
        this.showReloadEveryOnReloadButton();
        break;
      case "extensions.tabmix.tabBarMaxRow":
          var tabBar = gBrowser.tabContainer;
          let row = tabBar.maxRow;
          if (row < 2) {
            Tabmix.prefs.setIntPref("tabBarMaxRow", 2);
            return;
          }
          // maxRow changed
          if (TabmixTabbar.isMultiRow) {
            // we hide the button to see if tabs have rome without the scroll buttons
            if (tabBar.overflow && row > TabmixTabbar.visibleRows)
              tabBar.overflow = false;
            // after we update the height check if we are still in overflow
            if (tabBar.updateVerticalTabStrip() == "scrollbar")
              tabBar.overflow = true;
          }
          TabmixTabbar.updateBeforeAndAfter();
        break;
      case "extensions.tabmix.offsetAmountToScroll":
          gBrowser.tabContainer.mTabstrip.offsetAmountToScroll = Services.prefs.getBoolPref(prefName);
        break;
      case "browser.tabs.onTop":
        if (TabmixTabbar.position == 1 && Services.prefs.getBoolPref(prefName)) {
          Services.prefs.setBoolPref(prefName, false);
          return;
        }
        // multi-rows total heights can be diffrent when tabs are on top
        if (TabmixTabbar.visibleRows > 1) {
          TabmixTabbar.setHeight(1, true);
          gBrowser.tabContainer.updateVerticalTabStrip();
        }
        break;
      case "browser.newtab.url": // just for Firefox 12
        value =  Services.prefs.getComplexValue("browser.newtab.url", Ci.nsISupportsString).data;
        BROWSER_NEW_TAB_URL =  value || "about:blank";
        break;
      case "extensions.tabmix.tabBarMode":
      case "extensions.tabmix.tabBarSpace":
      case "extensions.tabmix.hideTabBarButton":
      case "extensions.tabmix.hideAllTabsButton":
      case "extensions.tabmix.newTabButton":
      case "extensions.tabmix.flexTabs":
      case "extensions.tabmix.setDefault":
        TabmixTabbar.updateSettings(false);
        break;
      case "extensions.tabmix.moveTabOnDragging":
        gBrowser.tabContainer.moveTabOnDragging = Services.prefs.getBoolPref(prefName);
        break;
      default:
        break;
    }

  },

  getStyleSheets: function TMP_PO_getStyleSheet(aHerf, aFirst) {
    var styleSheet = [];
    for (let i = 0; i < document.styleSheets.length; ++i) {
      if (document.styleSheets[i].href == aHerf) {
        styleSheet.push(document.styleSheets[i]);
        if (aFirst)
          break;
      }
    }
    return styleSheet;
  },

  _tabStyleSheet: null,
  get tabStyleSheet() {
    var href = "chrome://tabmixplus/skin/tab.css";
    // find tab.css to insert our dynamic rules into it.
    // insert our rules into document.styleSheets[0] cause problem with other extensions
    if (!this._tabStyleSheet || this._tabStyleSheet.href != href) {
      let ss = this.getStyleSheets(href, true);
      this._tabStyleSheet = ss.length ? ss[0] : document.styleSheets[1];
    }
    return this._tabStyleSheet;
  },

  dynamicRules: {},
  createColorRules: function TMP_PO_createColorRules() {
    var bottomBorder, ss = this.tabStyleSheet;
    this.gradients = { };
    if (Tabmix.isVersion(160)) {
      this.gradients.body = "linear-gradient(#colorCode, #colorCode)";
      bottomBorder = "linear-gradient(to top, rgba(10%,10%,10%,.4) 1px, transparent 1px)";
    }
    else {
      this.gradients.body = "-moz-linear-gradient(#colorCode, #colorCode)";
      bottomBorder = "-moz-linear-gradient(bottom, rgba(10%,10%,10%,.4) 1px, transparent 1px)";
    }
    this.gradients.tab = Tabmix.isMac ? this.gradients.body : (bottomBorder + "," + this.gradients.body);
    var backgroundRule = "{-moz-appearance: none; background-image: " + this.gradients.tab + " !important;}"
    var tabTextRule = " .tab-text { color: #colorCode !important;}";

    var styleRules = {
      currentTab:    { text:  '#tabbrowser-tabs[useCurrentColor] .tabbrowser-tab[selected="true"]' + tabTextRule,
                       bg  :  '#tabbrowser-tabs[useCurrentBGColor] .tabbrowser-tab[selected="true"],'+
                              '#tabbrowser-tabs[useCurrentBGColor][tabonbottom] .tabs-bottom' + backgroundRule},
      unloadedTab:   { text:  '#tabbrowser-tabs[useUnloadedColor] .tabbrowser-tab:not([selected="true"])[pending]' + tabTextRule,
                       bg:    '#tabbrowser-tabs[useUnloadedBGColor] .tabbrowser-tab:not([selected="true"])[pending]' + backgroundRule},
      unreadTab:     { text:  '#tabbrowser-tabs[useUnreadColor]:not([unloadedTab]) .tabbrowser-tab:not([visited]) .tab-text,' +
                              '#tabbrowser-tabs[useUnreadColor][unloadedTab] .tabbrowser-tab:not([visited]):not([pending])' +  tabTextRule,
                       bg:    '#tabbrowser-tabs[useUnreadBGColor]:not([unloadedTab]) .tabbrowser-tab:not([visited]),' +
                              '#tabbrowser-tabs[useUnreadBGColor][unloadedTab] .tabbrowser-tab:not([visited]):not([pending])' + backgroundRule},
      otherTab:      { text:  '#tabbrowser-tabs[useOtherColor]:not([unreadTab]):not([unloadedTab]) .tabbrowser-tab:not([selected="true"]) .tab-text,' +
                              '#tabbrowser-tabs[useOtherColor][unreadTab]:not([unloadedTab]) .tabbrowser-tab:not([selected="true"])[visited] .tab-text,' +
                              '#tabbrowser-tabs[useOtherColor]:not([unreadTab])[unloadedTab] .tabbrowser-tab:not([selected="true"]):not([pending]) .tab-text,' +
                              '#tabbrowser-tabs[useOtherColor][unreadTab][unloadedTab] .tabbrowser-tab:not([selected="true"])[visited]:not([pending])' + tabTextRule,
                       bg:    '#tabbrowser-tabs[useOtherBGColor]:not([unreadTab]):not([unloadedTab]) .tabbrowser-tab:not([selected="true"]),' +
                              '#tabbrowser-tabs[useOtherBGColor][unreadTab]:not([unloadedTab]) .tabbrowser-tab:not([selected="true"])[visited],' +
                              '#tabbrowser-tabs[useOtherBGColor]:not([unreadTab])[unloadedTab] .tabbrowser-tab:not([selected="true"]):not([pending]),' +
                              '#tabbrowser-tabs[useOtherBGColor][unreadTab][unloadedTab] .tabbrowser-tab:not([selected="true"])[visited]:not([pending])' + backgroundRule},
      progressMeter: { bg:    '#tabbrowser-tabs[useProgressColor] .tabbrowser-tab .progress-bar {background-color: #colorCode !important;}'}
    }

    if (Tabmix.isMac) {
      styleRules.currentTab.bg =
        '#tabbrowser-tabs[useCurrentBGColor] .tab-background-start[selected="true"],' +
        '#tabbrowser-tabs[useCurrentBGColor] .tab-background-middle[selected="true"],' +
        '#tabbrowser-tabs[useCurrentBGColor] .tab-background-end[selected="true"]' + backgroundRule;
      styleRules.unloadedTab.bg =
        '#tabbrowser-tabs[useUnloadedBGColor] .tab-background-start:not([selected="true"])[pending],' +
        '#tabbrowser-tabs[useUnloadedBGColor] .tab-background-middle:not([selected="true"])[pending],' +
        '#tabbrowser-tabs[useUnloadedBGColor] .tab-background-end:not([selected="true"])[pending]' + backgroundRule;
      styleRules.unreadTab.bg =
        '#tabbrowser-tabs[useUnreadBGColor]:not([unloadedTab]) .tab-background-start:not([visited]),' +
        '#tabbrowser-tabs[useUnreadBGColor]:not([unloadedTab]) .tab-background-middle:not([visited]),' +
        '#tabbrowser-tabs[useUnreadBGColor]:not([unloadedTab]) .tab-background-end:not([visited]),' +
        '#tabbrowser-tabs[useUnreadBGColor][unloadedTab] .tab-background-start:not([visited]):not([pending]),' +
        '#tabbrowser-tabs[useUnreadBGColor][unloadedTab] .tab-background-middle:not([visited]):not([pending]),' +
        '#tabbrowser-tabs[useUnreadBGColor][unloadedTab] .tab-background-end:not([visited]):not([pending])' + backgroundRule;
      styleRules.otherTab.bg =
        '#tabbrowser-tabs[useOtherBGColor]:not([unreadTab]):not([unloadedTab]) .tab-background-start:not([selected="true"]),' +
        '#tabbrowser-tabs[useOtherBGColor]:not([unreadTab]):not([unloadedTab]) .tab-background-middle:not([selected="true"]),' +
        '#tabbrowser-tabs[useOtherBGColor]:not([unreadTab]):not([unloadedTab]) .tab-background-end:not([selected="true"]),' +
        '#tabbrowser-tabs[useOtherBGColor][unreadTab]:not([unloadedTab]) .tab-background-start:not([selected="true"])[visited],' +
        '#tabbrowser-tabs[useOtherBGColor][unreadTab]:not([unloadedTab]) .tab-background-middle:not([selected="true"])[visited],' +
        '#tabbrowser-tabs[useOtherBGColor][unreadTab]:not([unloadedTab]) .tab-background-end:not([selected="true"])[visited],' +
        '#tabbrowser-tabs[useOtherBGColor]:not([unreadTab])[unloadedTab] .tab-background-start:not([selected="true"]):not([pending]),' +
        '#tabbrowser-tabs[useOtherBGColor]:not([unreadTab])[unloadedTab] .tab-background-middle:not([selected="true"]):not([pending]),' +
        '#tabbrowser-tabs[useOtherBGColor]:not([unreadTab])[unloadedTab] .tab-background-end:not([selected="true"]):not([pending]),' +
        '#tabbrowser-tabs[useOtherBGColor][unreadTab][unloadedTab] .tab-background-start:not([selected="true"])[visited]:not([pending]),' +
        '#tabbrowser-tabs[useOtherBGColor][unreadTab][unloadedTab] .tab-background-middle:not([selected="true"])[visited]:not([pending]),' +
        '#tabbrowser-tabs[useOtherBGColor][unreadTab][unloadedTab] .tab-background-end:not([selected="true"])[visited]:not([pending])' + backgroundRule;
    }
    else {
      styleRules.currentTab.bgTabsontop =
        '#TabsToolbar[tabsontop=true] > #tabbrowser-tabs[useCurrentBGColor] .tabbrowser-tab[selected="true"],' +
        '#TabsToolbar[tabsontop=true] > #tabbrowser-tabs[useCurrentBGColor][tabonbottom] .tabs-bottom' +
        "{background-image: " + this.gradients.body + " !important;}";
    }

    // Charter Toolbar extension add Object.prototype.toJSONString
    // that break the use      "for (var rule in styleRules)"
    var rules = ["currentTab", "unloadedTab", "unreadTab", "otherTab", "progressMeter"];
    for (let j = 0; j < rules.length; j++) {
      let rule = rules[j];
      this.setTabStyles("extensions.tabmix.styles." + rule, true);
      var prefValues = this.tabStylePrefs[rule];
      if (!prefValues)
        continue;

      var newRule, index;
      if (rule !=  "progressMeter") {
        newRule = styleRules[rule].text.replace("#colorCode",prefValues.textColor);
        index = ss.insertRule(newRule, ss.cssRules.length);
        this.dynamicRules[rule] = ss.cssRules[index];
      }
      newRule = styleRules[rule].bg.replace(/#colorCode/g,prefValues.bgColor);
      index = ss.insertRule(newRule, ss.cssRules.length);
      this.dynamicRules[rule + "bg"] = ss.cssRules[index];
      if (rule != "progressMeter")
        this.toggleTabStyles(rule);
    }
    if ("bgTabsontop" in styleRules.currentTab) {
      // bottom border for selected tab on top is diffrent
      let newRule = styleRules.currentTab.bgTabsontop.replace(/#colorCode/g, this.tabStylePrefs["currentTab"].bgColor);
      let index = ss.insertRule(newRule, ss.cssRules.length);
      this.dynamicRules["currentTab" + "bgTabsontop"] = ss.cssRules[index];
    }

    // rule for controling moz-margin-start when we have pinned tab in multi-row
    let marginStart = '#tabbrowser-tabs[positionpinnedtabs] > .tabbrowser-tab[tabmix-firstTabInRow="true"]{-moz-margin-start: 0px;}';
    let index = ss.insertRule(marginStart, ss.cssRules.length);
    this.dynamicRules["tabmix-firstTabInRow"] = ss.cssRules[index];

    // rule for progress-bar background-image
    // move it back to css file when we drop support for Firefox 11-15
    let backgroundImage = ".tab-progress > .progress-bar:-moz-locale-dir(#1) {" +
        "background-image: linear-gradient(#2, rgba(255,255,255,.1) 50%," +
                                              "rgba(255,255,255,.4) 90%,"+
                                              "rgba(255,255,255,.8));}"
    backgroundImage = backgroundImage.replace("#1", Tabmix.ltr ? "ltr" : "rtl");
    if (Tabmix.isVersion(160))
      backgroundImage = backgroundImage.replace("#2", Tabmix.ltr ? "to right" : "to left");
    else {
      backgroundImage = backgroundImage.replace("#2", Tabmix.ltr ? "left" : "rigth").
          replace("linear-gradient", "-moz-linear-gradient");
    }
    ss.insertRule(backgroundImage, ss.cssRules.length);

    // for ColorfulTabs 8.0+
    // add new rule to adjust selected tab bottom margin
    // we add the rule after the first tab added
    if (typeof colorfulTabs == "object") {
      let padding = Tabmix.getStyle(gBrowser.tabs[0], "paddingBottom");
      let newRule = '#tabbrowser-tabs[flowing="multibar"] > .tabbrowser-tab[selected=true]' +
                    ' {margin-bottom: -1px !important; padding-bottom: ' + (padding + 1) + 'px !important;}';
      let index = ss.insertRule(newRule, ss.cssRules.length);
      newRule = ss.cssRules[index];
      gBrowser.tabContainer.addEventListener("TabOpen", function TMP_addStyleRule(aEvent) {
        gBrowser.tabContainer.removeEventListener("TabOpen", TMP_addStyleRule, true);
        let padding = Tabmix.getStyle(aEvent.target, "paddingBottom");
        newRule.style.setProperty("padding-bottom", (padding + 1) + "px", "important");
      }, true);
    }
  },

  setTabIconMargin: function TMP_PO_setTabIconMargin() {
    var ss = this.tabStyleSheet;
    var [sMarginStart, sMarginEnd] = Tabmix.rtl ? ["margin-right", "margin-left"] : ["margin-left", "margin-right"];
    var icon = document.getAnonymousElementByAttribute(gBrowser.mCurrentTab, "class", "tab-icon-image");
    if (!icon)
      return; // nothing to do....

   /**
    *  from Firefox 3 tab-icon-image class have -moz-margin-start: value;
    *                                           -margin-end-value: value;
    *  we apply these value dynamically here to our tab-protect-icon tab-lock-icon class
    *  since each theme can use different values
    */
    let style = window.getComputedStyle(icon, null);
    let pinned;
    pinned = icon.hasAttribute("pinned");
    if (pinned)
      icon.removeAttribute("pinned");
    let marginStart = style.getPropertyValue(sMarginStart);
    this._marginStart = marginStart;
    let marginEnd = style.getPropertyValue(sMarginEnd);
    let selector = '.tab-icon:not([pinned]) > ';
    let iconRule = selector + '.tab-protect-icon,' +
                           selector + '.tab-reload-icon,' +
                           selector + '.tab-lock-icon {' +
                           '-moz-margin-start: %S; -moz-margin-end: %S;}'.replace("%S", marginStart).replace("%S", marginEnd);
    ss.insertRule(iconRule, ss.cssRules.length);
    icon.setAttribute("pinned", true);
    let _marginStart = style.getPropertyValue(sMarginStart);
    let _marginEnd = style.getPropertyValue(sMarginEnd);
    let _selector = '.tab-icon[pinned] > ';
    let _iconRule = _selector + '.tab-protect-icon,' +
                         _selector + '.tab-reload-icon,' +
                         _selector + '.tab-lock-icon {' +
                         '-moz-margin-start: %S; -moz-margin-end: %S;}'.replace("%S", _marginStart).replace("%S", _marginEnd);
    ss.insertRule(_iconRule, ss.cssRules.length);
    if (!pinned)
      icon.removeAttribute("pinned");

   /**
    *  set smaller left margin for the tab icon when the close button is on the left side
    *  only do it if start margin is bigger then end margin
    */
    if (parseInt(marginStart) < parseInt(marginEnd))
      return;

    function tabmix_setRule(aRule) {
      let newRule = aRule.replace(/%S/g, "tab-icon-image").replace("%PX", marginEnd);
      ss.insertRule(newRule, ss.cssRules.length);
      newRule = aRule.replace(/%S/g, "tab-lock-icon").replace("%PX", marginEnd);
      ss.insertRule(newRule, ss.cssRules.length);
    }
    iconRule = '.tabbrowser-tabs%favhideclose%[closebuttons-side="left"][closebuttons="alltabs"] > .tabbrowser-tab:not([pinned]):not([protected])%faviconized% .%S ,' +
                      '.tabbrowser-tabs%favhideclose%[closebuttons-side="left"][closebuttons="activetab"] > .tabbrowser-tab:not([pinned]):not([protected])[selected="true"]%faviconized% .%S {'+
                      '-moz-margin-start: %PX !important;}'
    if ("faviconize" in window) {
      let newRule = iconRule.replace(/%favhideclose%/g, ':not([favhideclose="true"])').replace(/%faviconized%/g, '');
      tabmix_setRule(newRule);
      newRule = iconRule.replace(/%favhideclose%/g, '[favhideclose="true"]').replace(/%faviconized%/g, ':not([faviconized="true"])');
      tabmix_setRule(newRule);
    }
    else {
      let newRule = iconRule.replace(/%favhideclose%/g, '').replace(/%faviconized%/g, '');
      tabmix_setRule(newRule);
    }
  },

  setCloseButtonMargin: function TMP_PO_setCloseButtonMargin() {
    var ss = this.tabStyleSheet;
    var [sMarginStart, sMarginEnd] = Tabmix.rtl ? ["margin-right", "margin-left"] : ["margin-left", "margin-right"];
    var icon = document.getAnonymousElementByAttribute(gBrowser.mCurrentTab, "button_side", "right") ||
               document.getAnonymousElementByAttribute(gBrowser.mCurrentTab, "class", "tab-close-button close-icon always-right");
    if (!icon)
      return; // nothing to do....

    let style = window.getComputedStyle(icon, null);
    let marginStart = style.getPropertyValue(sMarginStart);
    let marginEnd = style.getPropertyValue(sMarginEnd);
    // swap button margin-left margin-right for button on the left side
    if (marginStart != marginEnd) {
      let newRule = '.tab-close-button[button_side="left"] {' +
                    '-moz-margin-start: %PX !important;'.replace("%PX", marginEnd) +
                    '-moz-margin-end: %PX !important;}'.replace("%PX", marginStart);
      ss.insertRule(newRule, ss.cssRules.length);
    }
    // set right margin to text stack when close button is not right to it
    // on default theme the margin is zero, so we set the end margin to be the same as the start margin
    let textMarginEnd = parseInt(marginEnd) ? marginEnd : this._marginStart;
    delete this._marginStart;
    let iconRule = '.tabbrowser-tabs%favhideclose%[closebuttons="noclose"] > .tabbrowser-tab%faviconized%:not([pinned]) .tab-text-stack,' +
                            '.tabbrowser-tabs%favhideclose%[closebuttons-side="left"] > .tabbrowser-tab%faviconized%:not([pinned]) .tab-text-stack,' +
                            '.tabbrowser-tabs%favhideclose%[closebuttons="activetab"]:not([closebuttons-hover="notactivetab"])[closebuttons-side="right"] > .tabbrowser-tab%faviconized%:not([pinned]):not([selected="true"]) .tab-text-stack,' +
                            '.tabbrowser-tab%faviconized1%[protected]:not([pinned]) .tab-text-stack {' +
                            '-moz-margin-end: %PX !important;}'.replace("%PX", textMarginEnd);
    if ("faviconize" in window) {
      let newRule = iconRule.replace(/%favhideclose%/g, ':not([favhideclose="true"])').replace(/%faviconized%/g, '').replace(/%faviconized1%/g, ':not([faviconized="true"])');
      ss.insertRule(newRule, ss.cssRules.length);
      newRule = iconRule.replace(/%favhideclose%/g, '[favhideclose="true"]').replace(/%faviconized%/g, ':not([faviconized="true"])').replace(/%faviconized1%/g, ':not([faviconized="true"])');
      ss.insertRule(newRule, ss.cssRules.length);
      newRule = '.tabbrowser-tab[faviconized="true"][protected]:not([pinned]) {max-width: 36px !important;}';
      ss.insertRule(newRule, ss.cssRules.length);
    }
    else {
      let newRule = iconRule.replace(/%favhideclose%/g, '').replace(/%faviconized%/g, '').replace(/%faviconized1%/g, '');
      ss.insertRule(newRule, ss.cssRules.length);
    }
  },

  miscellaneousRules: function TMP_PO_miscellaneousRules() {
    // height shrink to actual size when the tabbar is in display: block (multi-row)
    let newHeight = gBrowser.tabContainer.visibleTabsFirstChild.getBoundingClientRect().height;
    let newRule = '#TabsToolbar:not([newTabButton=false]):not([disAllowNewtabbutton]):not([newtab_side]) >' +
                  '#tabbrowser-tabs:not([overflow="true"]) > .tabbrowser-arrowscrollbox[flowing="multibar"]' +
                  ' > .tabs-newtab-button[command="cmd_newNavigatorTab"] {height: #px;}'.replace("#", newHeight);
    this.tabStyleSheet.insertRule(newRule, this.tabStyleSheet.cssRules.length);

    if (!Tabmix.isPlatform("Mac") && !Tabmix.isPlatform("Linux")) {
      let newRule = '#TabsToolbar[multibar] > .toolbarbutton-1,' +
                    '#TabsToolbar[multibar] > #tabs-closebutton {' +
                    '  height: #px;}'.replace("#", newHeight);
      this.tabStyleSheet.insertRule(newRule, this.tabStyleSheet.cssRules.length);
    }
  },

  addWidthRules: function TMP_PO_addWidthRules() {
    let tst = Tabmix.extensions.treeStyleTab ? ":not([treestyletab-collapsed='true'])" : "";
    let newRule = ".tabbrowser-tab[fadein]" + tst + ":not([pinned]) {min-width: #1px !important; max-width: #2px !important;}";
    let _max = Services.prefs.getIntPref("browser.tabs.tabMaxWidth");
    let _min = Services.prefs.getIntPref("browser.tabs.tabMinWidth");
    newRule = newRule.replace("#1" ,_min).replace("#2" ,_max);
    let ss = this.tabStyleSheet;
    let index = ss.insertRule(newRule, ss.cssRules.length);
    this.dynamicRules["width"] = ss.cssRules[index];
  },

  defaultStylePrefs: {    currentTab: {italic:false,bold:false,underline:false,text:true,textColor:'rgba(0,0,0,1)',bg:false,bgColor:'rgba(236,233,216,1)'},
                          unloadedTab: {italic:true,bold:false,underline:false,text:true,textColor:'rgba(204,0,0,1)',bg:true,bgColor:'rgba(236,233,216,1)'},
                           unreadTab: {italic:true,bold:false,underline:false,text:true,textColor:'rgba(204,0,0,1)',bg:false,bgColor:'rgba(236,233,216,1)'},
                            otherTab: {italic:false,bold:false,underline:false,text:true,textColor:'rgba(0,0,0,1)',bg:false,bgColor:'rgba(236,233,216,1)'},
                       progressMeter: {bg:true,bgColor:'rgba(170,170,255,1)'}},

  tabStylePrefs: {},
  setTabStyles: function TMP_PO_setTabStyles(prefName, start) {
    var ruleName = prefName.split(".").pop();
    if (ruleName in this && this[ruleName] == "preventUpdate")
      return;
    this[ruleName] = "preventUpdate";

    // Converts a color string in the format "#RRGGBB" to rgba(r,g,b,a).
    function getRGBcolor(aColorCode, aOpacity) {
      var newRGB = [];
      var _length = aColorCode.length;
      if (/^rgba|rgb/.test(aColorCode)) {
        newRGB = aColorCode.replace(/rgba|rgb|\(|\)/g,"").split(",").splice(0, 4);
        if (newRGB.length < 3)
          return null;
        for (var i = 0; i < newRGB.length; i++) {
          if (isNaN(newRGB[i].replace(/[\s]/g,"") * 1))
            return null ;
        }
      }
      else if (/^#/.test(aColorCode) && _length == 4 || _length == 7) {
        aColorCode = aColorCode.replace("#","");
        var subLength = _length == 7 ? 2 : 1;
        var newRGB = [];
        for (var i = 0; i < 3; i++) {
          var subS = aColorCode.substr(i*subLength, subLength);
          if (_length == 4)
            subS += subS;
          var newNumber = parseInt(subS, 16);
          if (isNaN(newNumber))
            return null;
          newRGB.push(newNumber);
        }
      }
      else
        return null;

      if (aOpacity != null)
        newRGB[3] = aOpacity;
      else if (newRGB[3] == null || newRGB[3] < 0 || newRGB[3] > 1)
        newRGB[3] = 1;
      return "rgba(" + newRGB.join(",") + ")";
    }

    // styles format: italic:boolean, bold:boolean, underline:boolean,
    //                text:boolean, textColor:string, textOpacity:string,
    //                bg:boolean, bgColor:string, bgOpacity:striung
    // if we don't catch the problem here it can break the rest of tabmix startup
    var defaultPrefValues = this.defaultStylePrefs[ruleName];
    var prefValues = {};
    if (Services.prefs.prefHasUserValue(prefName)) {
      let prefString = Services.prefs.getCharPref(prefName);
      try {
        var currentPrefValues = TabmixSvc.JSON.parse(prefString);
        if (currentPrefValues == null)
          throw Error(prefName + " value is invalid\n" + prefString)
      }
      catch (ex) {
        Tabmix.log(ex);
        try {
          // convert old format to JSON string
          // we do it only one time when user update Tabmix from old version
          currentPrefValues = Components.utils.evalInSandbox("({" + prefString  + "})",
                              new Components.utils.Sandbox("about:blank"));
          Services.prefs.setCharPref(prefName, TabmixSvc.JSON.stringify(currentPrefValues));
        } catch (e) {
           Tabmix.log('Error in preference "' + prefName + '", value was reset to default');
           Tabmix.assert(e);
           Services.prefs.clearUserPref(prefName);
           // set prev value to default so we can continue with this function
           currentPrefValues = defaultPrefValues;
        }
      }

      // make sure we have all the item
      // if item is missing set it to default
      for (let item in defaultPrefValues) {
        let value = currentPrefValues[item];
        if (value && item.indexOf("Color") > -1) {
          let opacity = item.replace("Color", "Opacity");
          let opacityValue = opacity in currentPrefValues ? currentPrefValues[opacity] : null;
          value = getRGBcolor(value, opacityValue);
        }
        else if (value != null && typeof(value) != "boolean") {
          if (/^true$|^false$/.test(value.replace(/[\s]/g,"")))
            value = value == "true" ? true : false;
          else
            value = null;
        }
        if (value == null)
          prefValues[item] = defaultPrefValues[item];
        else
          prefValues[item] = value;
      }
      if (currentPrefValues != prefValues)
        Services.prefs.setCharPref(prefName, TabmixSvc.JSON.stringify(prefValues));
    }
    else
      prefValues = defaultPrefValues;

    var currentValue = this.tabStylePrefs[ruleName];
    this.tabStylePrefs[ruleName] = prefValues;
    if (currentValue && !start) {
      // we get here only when user changed pref value
      if (currentValue.bgColor != prefValues.bgColor) {
        if (ruleName != "progressMeter") {
          let newRule = this.gradients.tab.replace(/#colorCode/g, prefValues.bgColor);
          this.dynamicRules[ruleName + "bg"].style.setProperty("background-image", newRule, "important");
          if (ruleName + "bgTabsontop" in this.dynamicRules) {
            newRule = this.gradients.body.replace(/#colorCode/g, prefValues.bgColor);
            this.dynamicRules[ruleName + "bgTabsontop"].style.setProperty("background-image", newRule, "important");
          }
        }
        else
          this.dynamicRules[ruleName + "bg"].style.setProperty("background-color", prefValues.bgColor, "important");
      }

      if (ruleName != "progressMeter") {
        if (currentValue.textColor != prefValues.textColor)
          this.dynamicRules[ruleName].style.setProperty("color", prefValues.textColor, "important");
        this.toggleTabStyles(prefName);
      }
      else
        this.setProgressMeter();
    }
    delete this[ruleName];
  },

  toggleTabStyles: function TMP_PO_toggleTabStyles(prefName) {
    var ruleName = prefName.split(".").pop();

    var attrib = (ruleName.charAt(0).toUpperCase() + ruleName.substr(1)).replace("Tab","");
    var tabBar = gBrowser.tabContainer;
    var currentBoldStyle = tabBar.getAttribute("bold" + attrib) == "true";
    var prefValues = this.tabStylePrefs[ruleName];

    var control = Tabmix.prefs.getBoolPref(ruleName);
    // we need to set unreadTab & unloadedTab when they are on
    // in order to control other tabs that aren't read or unloaded
    if (ruleName == "unreadTab" || ruleName == "unloadedTab")
      Tabmix.setItem(tabBar, ruleName,                control || null);

    // set bold, italic and underline only wehn we control the sytle
    // to override theme default rule if exist
    Tabmix.setItem(tabBar, "bold" + attrib,           control ? prefValues.bold : null);
    Tabmix.setItem(tabBar, "italic" + attrib,         control ? prefValues.italic : null);
    Tabmix.setItem(tabBar, "underline" + attrib,      control ? prefValues.underline : null);

    Tabmix.setItem(tabBar, "use"+ attrib + "Color",   control && prefValues.text || null);
    Tabmix.setItem(tabBar, "use"+ attrib + "BGColor", control && prefValues.bg || null);

    // changeing bold attribute can change tab width and effect tabBar scroll status
    // also when we turn off unloaded, unread and other style diffrent style can take
    // control with a diffrent bold attribute
    TabmixTabbar.updateScrollStatus();
    TabmixTabbar.updateBeforeAndAfter();
  },

  setProgressMeter: function () {
    // we don't change attribute to be compatible with theme that maybe use this values
    var showOnTabs = Tabmix.prefs.getBoolPref("progressMeter");
    Tabmix.setItem(gBrowser.tabContainer, "useProgressColor", showOnTabs && this.tabStylePrefs["progressMeter"].bg || null);
    Tabmix.setItem(gBrowser.tabContainer, "progressMeter", showOnTabs || null);
    TabmixProgressListener.listener.showProgressOnTab = showOnTabs;
  },

  setLink_openPrefs: function() {
    if (!Tabmix.singleWindowMode)
      return;

    function updateStatus(pref, testVal, test, newVal) {
      try {
        var prefValue = Services.prefs.getIntPref(pref);
        test = test ? prefValue == testVal : prefValue != testVal
      }
      catch(e){ test = true; }

      if (test)
        Services.prefs.setIntPref(pref, newVal);
    }

    updateStatus("browser.link.open_newwindow", 2, true, 3);
    updateStatus("browser.link.open_newwindow.override.external", 2, true, 3);
    updateStatus("browser.link.open_newwindow.restriction", 0, false, 0);
  },

  // code for Single Window Mode...
  // disable the "Open New Window action
  // disable & hides some menuitem
  setSingleWindowUI: function() {
    Tabmix.singleWindowMode = Tabmix.prefs.getBoolPref("singleWindow");
    var newWindowButton = document.getElementById("new-window-button");
    if (newWindowButton)
      newWindowButton.setAttribute("disabled", Tabmix.singleWindowMode);

    var items = document.getElementsByAttribute("command", "cmd_newNavigator");
    for (let i = 0; i < items.length; i++) {
      if (items[i].localName == 'menuitem')
        items[i].setAttribute("hidden", Tabmix.singleWindowMode);
    }

    var frameMenu = document.getElementById("frame");
    if (frameMenu) {
      let menuItem = frameMenu.getElementsByAttribute("oncommand", "gContextMenu.openFrame();")[0];
      if (menuItem)
        menuItem.setAttribute("hidden", Tabmix.singleWindowMode);
    }

    document.getElementById("tmOpenInNewWindow").hidden = Tabmix.singleWindowMode;
  },

  setMenuIcons: function() {
    function setClass(items, hideIcons) {
      if (hideIcons)
        for (var i = 0; i < items.length; ++i)
          items[i].removeAttribute("class");
      else
        for ( i = 0; i < items.length; ++i)
          items[i].setAttribute("class", items[i].getAttribute("tmp_iconic"));
    }
    var hideIcons = Tabmix.prefs.getBoolPref("hideIcons");
    var iconicItems = document.getElementsByAttribute("tmp_iconic", "*");
    setClass(iconicItems, hideIcons);

    iconicItems = gBrowser.tabContextMenu.getElementsByAttribute("tmp_iconic", "*");
    setClass(iconicItems, hideIcons);
  },

  setAutoHidePref: function() {
    TabmixTabbar.hideMode = Tabmix.prefs.getIntPref("hideTabbar");
    if (Tabmix.isVersion(230)) {// after Bug 855370
      gBrowser.tabContainer.updateVisibility();
      return;
    }
    var autoHide = TabmixTabbar.hideMode != 0;
    if (autoHide != Services.prefs.getBoolPref("browser.tabs.autoHide")) {
      Services.prefs.setBoolPref("browser.tabs.autoHide", autoHide);
      if (TabmixTabbar.hideMode == 1)
        gBrowser.tabContainer.updateVisibility();
    }
  },

  setTabBarVisibility: function TMP_PO_setTabBarVisibility(onFullScreenExit) {
    if (TabmixTabbar.hideMode == 2)
      gBrowser.tabContainer.visible = false;
    else if (!gBrowser.tabContainer.visible) {
      let moreThenOneTab = gBrowser.tabs.length > 1;
      gBrowser.tabContainer.visible = moreThenOneTab || TabmixTabbar.hideMode == 0;
      if (moreThenOneTab) {
        gBrowser.ensureTabIsVisible(gBrowser.selectedTab, false);
        TabmixTabbar.updateBeforeAndAfter();
      }
    }
  },

  changeNewTabButtonSide: function(aPosition) {
    var tabBar = gBrowser.tabContainer;
    tabBar._checkNewtabButtonVisibility = false;
    let newTabButton = document.getElementById("new-tab-button");
    if (newTabButton && newTabButton.parentNode == gBrowser.tabContainer._container) {
      let sideChanged, tabsToolbar = document.getElementById("TabsToolbar");
      let toolBar = Array.slice(tabsToolbar.childNodes);
      let buttonIndex = toolBar.indexOf(newTabButton);
      let tabsIndex = toolBar.indexOf(gBrowser.tabContainer);
      if (aPosition == 0) {
        Tabmix.setItem(tabsToolbar, "newtab_side", "left");
        if (buttonIndex > tabsIndex) {
          newTabButton.parentNode.insertBefore(newTabButton, gBrowser.tabContainer);
          sideChanged = true;
        }
      }
      else {
        Tabmix.setItem(tabsToolbar, "newtab_side", aPosition == 1 ? "right" : null);
        if (buttonIndex < tabsIndex) {
          let before = gBrowser.tabContainer.nextSibling;
          if (document.getElementById("tabmixScrollBox")) {
            before = before.nextSibling;
            tabsIndex++;
          }
          newTabButton.parentNode.insertBefore(newTabButton, before);
          sideChanged = true;
        }
      }
      if (sideChanged) {
        let cSet = tabsToolbar.getAttribute("currentset") || tabsToolbar.getAttribute("defaultset");
        cSet = cSet.split(",");
        cSet.splice(tabsIndex, 0, cSet.splice(buttonIndex, 1)[0] || "new-tab-button");
        tabsToolbar.setAttribute("currentset", cSet.join(","));
        document.persist("TabsToolbar", "currentset");
      }
      tabBar._checkNewtabButtonVisibility = TabmixTabbar.isMultiRow && Tabmix.prefs.getBoolPref("newTabButton") && aPosition == 2;
      Tabmix.setItem("TabsToolbar", "newTabButton", Tabmix.prefs.getBoolPref("newTabButton"));
      tabBar._rightNewTabButton = newTabButton;
    }
    else {
      Tabmix.setItem("TabsToolbar", "newTabButton", false);
      tabBar._rightNewTabButton = null;
    }
  },

  tabBarPositionChanged: function(aPosition) {
    if (aPosition > 1 || (aPosition != 0 && Tabmix.extensions.verticalTabBar)) {
      Tabmix.prefs.setIntPref("tabBarPosition", 0);
      return false;
    }
    if (TabmixTabbar.position == aPosition)
      return false;

    TabmixTabbar.position = aPosition;
    gBrowser.tabContainer._tabDropIndicator.removeAttribute("style");
    var tabsToolbar = document.getElementById("TabsToolbar");
    var bottomToolbox = document.getElementById("tabmix-bottom-toolbox");
    Tabmix.setItem(tabsToolbar, "tabbaronbottom", TabmixTabbar.position == 1 || null);

    // TabsOnTop removed by bug 755593
    if (window.TabsOnTop)
      this.setTabsOnTop(TabmixTabbar.position == 1);

    if (TabmixTabbar.position == 1) {// bottom
      if (!bottomToolbox) {
        bottomToolbox = document.createElement("toolbox");
        bottomToolbox.setAttribute("id", "tabmix-bottom-toolbox");
        bottomToolbox.collapsed = !gBrowser.tabContainer.visible;
        if (navigator.oscpu.indexOf("Windows NT 6.1") == 0)
          bottomToolbox.setAttribute("tabmix_aero", true);
        // if we decide to move this box into browser-bottombox
        // remember to fix background css rules for all platform
        let warningContainer = document.getElementById("full-screen-warning-container");
        warningContainer.parentNode.insertBefore(bottomToolbox, warningContainer);
      }
      if (gBrowser.tabContainer.visible)
        this.updateTabbarBottomPosition();
      else {
        // the tabbar is hidden on startup
        let height = gBrowser.tabContainer.mTabstrip.scrollClientRect.height;
        bottomToolbox.style.setProperty("height", height + "px", "important");
        tabsToolbar.style.setProperty("top", screen.availHeight + "px", "important");
        tabsToolbar.setAttribute("width", screen.availWidth);
      }
    }
    else {// top
      this._bottomRect = {top:null, width:null, height:null};
      bottomToolbox.style.removeProperty("height");
      tabsToolbar.style.removeProperty("top");
      tabsToolbar.removeAttribute("width");
    }
    // force TabmixTabbar.setHeight to set tabbar height
    TabmixTabbar.visibleRows = 1;
    return true;
  },

  // TabsOnTop removed by bug 755593
  setTabsOnTop: function(onBottom) {
    // hide/show TabsOnTop menu & menuseparator
    let toggleTabsOnTop = document.getElementsByAttribute("command", "cmd_ToggleTabsOnTop");
    for (let i = 0; i < toggleTabsOnTop.length; i++) {
      let cmd = toggleTabsOnTop[i];
      cmd.hidden = onBottom;
      if (cmd.nextSibling && cmd.nextSibling.localName == "menuseparator")
        cmd.nextSibling.hidden = onBottom;
    }

    if (onBottom) {
      // save TabsOnTop status
      if (TabsOnTop.enabled) {
        gNavToolbox.tabmix_tabsontop = true;
        TabsOnTop.enabled = false;
      }
    }
    else if (gNavToolbox.tabmix_tabsontop) {
      TabsOnTop.enabled = true;
      gNavToolbox.tabmix_tabsontop = false;
    }
  },

  _bottomRect: {top:null, width:null, height:null},
  updateTabbarBottomPosition: function TMP_PO_updateTabbarBottomPosition(aEvent) {
    if (TabmixTabbar.position != 1 || !gBrowser.tabContainer.visible)
      return;

    let bottomToolbox = document.getElementById("tabmix-bottom-toolbox");
    if (bottomToolbox.collapsed != gInPrintPreviewMode)
      bottomToolbox.collapsed = gInPrintPreviewMode;
    if (gInPrintPreviewMode)
      return;

    if (aEvent && aEvent.target != window) {
      // when the event is not from the window check if tabmix-bottom-toolbox
      // change its position
      let rect = bottomToolbox.getBoundingClientRect();
      if (rect.top == this._bottomRect.top &&
          rect.width == this._bottomRect.width)
        return;
    }

    let tabsToolbar = document.getElementById("TabsToolbar");
    // when we here after many tabs closed fast mTabstrip height can larger
    // then one row.
    let newHeight = TabmixTabbar.visibleRows == 1 ? TabmixTabbar.singleRowHeight :
            gBrowser.tabContainer.mTabstrip.scrollClientRect.height;
    if (this._bottomRect.height != newHeight) {
      this._bottomRect.height = newHeight;
      bottomToolbox.style.setProperty("height", newHeight + "px", "important");
    }
    // get new rect after changing the height
    let rect = bottomToolbox.getBoundingClientRect();
    if (this._bottomRect.top != rect.top) {
      this._bottomRect.top = rect.top;
      tabsToolbar.style.setProperty("top", rect.top + "px", "important");
    }
    if (this._bottomRect.width != rect.width) {
      this._bottomRect.width = rect.width;
      tabsToolbar.setAttribute("width", rect.width);
    }
  },

  // Show Reload Every menu on Reload button
  showReloadEveryOnReloadButton: function() {
    let show = Tabmix.prefs.getBoolPref("reloadEvery.onReloadButton");
    let reloadButton = document.getElementById("reload-button");
    if (reloadButton) {
      Tabmix.setItem(reloadButton, "type", show ? "menu-button" : null);
      Tabmix.setItem(reloadButton, "context", show ? "autoreload_popup" : null);
      Tabmix.setItem("stop-button", "context", show ? "autoreload_popup" : null);
    }

    Tabmix.setItem("urlbar-go-button", "context", show ? "autoreload_popup" : null);
    Tabmix.setItem("urlbar-reload-button", "context", show ? "autoreload_popup" : null);
    Tabmix.setItem("urlbar-stop-button", "context", show ? "autoreload_popup" : null);
  },

  // we replace some Tabmix settings with Firefox settings
  updateSettings: function() {
    function getPrefByType(prefName, aDefault, aType) {
      let PrefFn = {0: "", 32: "CharPref", 64: "IntPref", 128: "BoolPref"};
      let fn = PrefFn[Services.prefs.getPrefType(prefName)];
      try {
        var val = Services.prefs["get" + fn](prefName);
        // bug in version 0.4.1.0 import old int pref with zero (0)
        // value into string pref
        if (aType == "IntPref" && fn != aType)
          val = parseInt(val);
      } catch (ex) {
        Tabmix.log("gTMPprefObserver.updateSettings can't read preference " + prefName + "\n" + ex);
        val = typeof aDefault == "undefined" ? null : aDefault;
      }
      Services.prefs.clearUserPref(prefName);
      return val;
    }

    if (Tabmix.prefs.prefHasUserValue("undoCloseCache")) {
       var max_tabs_undo = getPrefByType("extensions.tabmix.undoCloseCache", 5, "IntPref");
       Services.prefs.setIntPref("browser.sessionstore.max_tabs_undo", max_tabs_undo);
    }
    // remove disp=attd&view=att it's make problem with gMail
    if (Tabmix.prefs.prefHasUserValue("filetype")) {
       var filetype = Tabmix.prefs.getCharPref("filetype");
       filetype = filetype.replace("/disp=attd&view=att/","").replace("  ", " ").trim();
       Tabmix.prefs.setCharPref("filetype", filetype);
    }
    // 2008-08-17
    if (Tabmix.prefs.prefHasUserValue("opentabfor.search")) {
       Services.prefs.setBoolPref("browser.search.openintab", Tabmix.prefs.getBoolPref("opentabfor.search"));
       Tabmix.prefs.clearUserPref("opentabfor.search");
    }
    // 2008-09-23
    if (Tabmix.prefs.prefHasUserValue("keepWindow")) {
       Services.prefs.setBoolPref("browser.tabs.closeWindowWithLastTab", !Tabmix.prefs.getBoolPref("keepWindow"));
       Tabmix.prefs.clearUserPref("keepWindow");
    }
    // 2008-09-23
    if (Services.prefs.prefHasUserValue("browser.ctrlTab.mostRecentlyUsed")) {
       Services.prefs.setBoolPref("browser.ctrlTab.previews", Services.prefs.getBoolPref("browser.ctrlTab.mostRecentlyUsed"));
       Services.prefs.clearUserPref("browser.ctrlTab.mostRecentlyUsed");
    }
    // 2008-09-28
    if (Tabmix.prefs.prefHasUserValue("lasttab.handleCtrlTab")) {
       Services.prefs.setBoolPref("browser.ctrlTab.previews", Tabmix.prefs.getBoolPref("lasttab.handleCtrlTab"));
       Tabmix.prefs.clearUserPref("lasttab.handleCtrlTab");
    }
    // 2008-11-29
    if (Tabmix.prefs.prefHasUserValue("maxWidth")) {
       let val = getPrefByType("extensions.tabmix.maxWidth", 250, "IntPref");
       Services.prefs.setIntPref("browser.tabs.tabMaxWidth", val);
    }
    // 2008-11-29
    if (Tabmix.prefs.prefHasUserValue("minWidth")) {
       let val = getPrefByType("extensions.tabmix.minWidth", 100, "IntPref");
       Services.prefs.setIntPref("browser.tabs.tabMinWidth", val);
    }
    // 2009-01-31
    if (Tabmix.prefs.prefHasUserValue("newTabButton.leftside")) {
       Tabmix.prefs.setIntPref("newTabButton.position", Tabmix.prefs.getBoolPref("newTabButton.leftside") ? 0 : 2);
       Tabmix.prefs.clearUserPref("newTabButton.leftside");
    }
    // 2009-10-10
    // swap prefs --> warn when closing window "extensions.tabmix.windows.warnOnClose" replaced with "browser.tabs.warnOnClose"
    //                warn when closing tabs "browser.tabs.warnOnClose" replaced with "extensions.tabmix.tabs.warnOnClose"
    if (Tabmix.prefs.prefHasUserValue("windows.warnOnClose")) {
       Tabmix.prefs.setBoolPref("tabs.warnOnClose", Services.prefs.getBoolPref("browser.tabs.warnOnClose"));
       Services.prefs.setBoolPref("browser.tabs.warnOnClose", Tabmix.prefs.getBoolPref("windows.warnOnClose"));
       Tabmix.prefs.clearUserPref("windows.warnOnClose");
    }
    // 2010-03-07
    if (Tabmix.prefs.prefHasUserValue("extraIcons")) {
       Tabmix.prefs.setBoolPref("extraIcons.locked", Tabmix.prefs.getBoolPref("extraIcons"));
       Tabmix.prefs.setBoolPref("extraIcons.protected", Tabmix.prefs.getBoolPref("extraIcons"));
       Tabmix.prefs.clearUserPref("extraIcons");
    }
    // 2010-06-05
    if (Tabmix.prefs.prefHasUserValue("tabXMode")) {
      let val = getPrefByType("extensions.tabmix.tabXMode", 1, "IntPref");
      Tabmix.prefs.setIntPref("tabs.closeButtons", val);
    }
    // partly fix a bug from version 0.3.8.3
    else if (Services.prefs.prefHasUserValue("browser.tabs.closeButtons") && !Tabmix.prefs.prefHasUserValue("version") &&
             !Tabmix.prefs.prefHasUserValue("tabs.closeButtons")) {
      let value = getPrefByType("browser.tabs.closeButtons", 1, "IntPref");
      // these value are from 0.3.8.3. we don't know if 0,1 are also from 0.3.8.3 so we don't use 0,1.
      if (value > 1 && value <= 6) {
        let newValue = [3,5,1,1,2,4,1][value];
        Tabmix.prefs.setIntPref("tabs.closeButtons", newValue);
      }
    }
    if (Tabmix.prefs.prefHasUserValue("tabXMode.enable")) {
      Tabmix.prefs.setBoolPref("tabs.closeButtons.enable", Tabmix.prefs.getBoolPref("tabXMode.enable"));
      Tabmix.prefs.clearUserPref("tabXMode.enable");
    }
    if (Tabmix.prefs.prefHasUserValue("tabXLeft")) {
      Tabmix.prefs.setBoolPref("tabs.closeButtons.onLeft", Tabmix.prefs.getBoolPref("tabXLeft"));
      Tabmix.prefs.clearUserPref("tabXLeft");
    }
    if (Tabmix.prefs.prefHasUserValue("tabXDelay")) {
      let val = getPrefByType("extensions.tabmix.tabXDelay", 50, "IntPref");
      Tabmix.prefs.setIntPref("tabs.closeButtons.delay", val);
    }
    // 2010-09-16
    if (Tabmix.prefs.prefHasUserValue("speLink")) {
      let val = getPrefByType("extensions.tabmix.speLink", 0, "IntPref");
      Tabmix.prefs.setIntPref("opentabforLinks", val);
      Tabmix.prefs.setBoolPref("lockallTabs", val == 1);
    }
    // 2010-10-12
    if (Tabmix.prefs.prefHasUserValue("hideurlbarprogress")) {
      Tabmix.prefs.clearUserPref("hideurlbarprogress");
    }
    // 2011-01-26
    if (Tabmix.prefs.prefHasUserValue("mouseDownSelect")) {
      Tabmix.prefs.setBoolPref("selectTabOnMouseDown", Tabmix.prefs.getBoolPref("mouseDownSelect"));
      Tabmix.prefs.clearUserPref("mouseDownSelect");
    }
    // 2011-10-11
    if (Services.prefs.prefHasUserValue("browser.link.open_external")) {
      let val = getPrefByType("browser.link.open_external", 3, "IntPref");
      let val1 = getPrefByType("browser.link.open_newwindow", 3, "IntPref");
      if (val == val1)
        val = -1;
      Services.prefs.setIntPref("browser.link.open_newwindow.override.external", val);
    }
    // 2011-11-26
    if (Tabmix.prefs.prefHasUserValue("clickToScroll.scrollDelay")) {
      let val = getPrefByType("extensions.tabmix.clickToScroll.scrollDelay", 150, "IntPref");
      Services.prefs.setIntPref("toolkit.scrollbox.clickToScroll.scrollDelay", val);
    }
    // 2012-03-21
    var _loadOnNewTab = true, _replaceLastTabWith = true;
    if (Tabmix.prefs.prefHasUserValue("loadOnNewTab")) {
      let val = getPrefByType("extensions.tabmix.loadOnNewTab", 4, "IntPref");
      Tabmix.prefs.setIntPref("loadOnNewTab.type", val);
      _loadOnNewTab = false;
    }
    if (Tabmix.prefs.prefHasUserValue("replaceLastTabWith")) {
      let val = getPrefByType("extensions.tabmix.replaceLastTabWith", 4, "IntPref");
      Tabmix.prefs.setIntPref("replaceLastTabWith.type", val);
      _replaceLastTabWith = false;
    }
    // Changing our preference to use New Tab Page as default starting from Firefox 12
    function _setNewTabUrl(oldPref, newPref, controlPref) {
      if (Services.prefs.prefHasUserValue(oldPref)) {
        let nsISupportsString = Ci.nsISupportsString;
        let str = Cc["@mozilla.org/supports-string;1"].createInstance(nsISupportsString);
        str.data = Services.prefs.getComplexValue(oldPref, nsISupportsString).data;
        // only updtae new preference value if the old control preference is New Tab Page
        let control = controlPref == null || Tabmix.prefs.prefHasUserValue(controlPref) &&
                      Tabmix.prefs.getIntPref(controlPref) == 4;
        if (str.data != "" && control)
          Services.prefs.setComplexValue(newPref, nsISupportsString, str);
        Services.prefs.clearUserPref(oldPref);
      }
    }
    if (typeof isBlankPageURL != "function") {
      _setNewTabUrl("extensions.tabmix.newTabUrl", "extensions.tabmix.newtab.url", "loadOnNewTab.type");
      _setNewTabUrl("extensions.tabmix.newTabUrl_afterLastTab",
                    "extensions.tabmix.replaceLastTabWith.newTabUrl", "replaceLastTabWith.type");
    }
    else {
      _setNewTabUrl("extensions.tabmix.newTabUrl", "browser.newtab.url", "loadOnNewTab.type");
      _setNewTabUrl("extensions.tabmix.newTabUrl_afterLastTab",
                    "extensions.tabmix.replaceLastTabWith.newtab.url", "replaceLastTabWith.type");
      _setNewTabUrl("extensions.tabmix.newtab.url", "browser.newtab.url");
      _setNewTabUrl("extensions.tabmix.replaceLastTabWith.newTabUrl",
                    "extensions.tabmix.replaceLastTabWith.newtab.url");
    }
    // 2012-04-12
    if (Services.prefs.prefHasUserValue("browser.tabs.loadFolderAndReplace")) {
      Tabmix.prefs.setBoolPref("loadFolderAndReplace", Services.prefs.getBoolPref("browser.tabs.loadFolderAndReplace"));
      Services.prefs.clearUserPref("browser.tabs.loadFolderAndReplace");
    }
try {
    // 2012-06-22 - remove the use of extensions.tabmix.tabMinWidth/tabMaxWidth
    // other extensions still use browser.tabs.tabMinWidth/tabMaxWidth
    if (Tabmix.prefs.prefHasUserValue("tabMinWidth")) {
      let val = getPrefByType("extensions.tabmix.tabMinWidth", 100, "IntPref");
      Services.prefs.setIntPref("browser.tabs.tabMinWidth", val);
    }
    if (Tabmix.prefs.prefHasUserValue("tabMaxWidth")) {
      let val = getPrefByType("extensions.tabmix.tabMaxWidth", 250, "IntPref");
      Services.prefs.setIntPref("browser.tabs.tabMaxWidth", val);
      Tabmix.prefs.clearUserPref("tabMaxWidth");
    }
} catch (ex) {Tabmix.assert(ex);}
    // 2013-01-21 - lock hideIcons to true in mac
    if (Services.appinfo.OS == "Darwin" && !Tabmix.prefs.prefIsLocked("hideIcons")) {
      Tabmix.defaultPrefs.setBoolPref("hideIcons", true);
      Tabmix.prefs.clearUserPref("hideIcons");
      Tabmix.prefs.lockPref("hideIcons");
    }

    // 2013-01-18
    var useF8Key, useF9Key;
    if (Tabmix.prefs.prefHasUserValue("disableF8Key")) {
      useF8Key = !Tabmix.prefs.getBoolPref("disableF8Key");
      Tabmix.prefs.clearUserPref("disableF8Key");
    }
    if (Tabmix.prefs.prefHasUserValue("disableF9Key")) {
      useF9Key = !Tabmix.prefs.getBoolPref("disableF9Key");
      Tabmix.prefs.clearUserPref("disableF9Key");
    }
    if (useF8Key || useF9Key) {
      let shortcuts = TabmixSvc.JSON.parse(Tabmix.prefs.getCharPref("shortcuts"));
      if (useF8Key)
        shortcuts.slideShow = "VK_F8";
      if (useF9Key)
        shortcuts.toggleFLST = "VK_F9";
      Tabmix.prefs.setCharPref("shortcuts", TabmixSvc.JSON.stringify(shortcuts));
    }
    // 2013-09-04
    if (Tabmix.prefs.prefHasUserValue("enableScrollSwitch")) {
      // enableScrollSwitch non-default value was true that is now 1
      Tabmix.prefs.setIntPref("scrollTabs", 1);
      Tabmix.prefs.clearUserPref("enableScrollSwitch");
    }

    // verify valid value
    if (Tabmix.prefs.prefHasUserValue("tabs.closeButtons")) {
      let value = Tabmix.prefs.getIntPref("tabs.closeButtons");
      if (value < 1 || value > 5)
        Tabmix.prefs.clearUserPref("tabs.closeButtons");
    }
    // 2011-01-22 - verify sessionstore enabled
    Services.prefs.clearUserPref("browser.sessionstore.enabled");

    let getVersion = function _getVersion(currentVersion) {
      let oldVersion = Tabmix.prefs.prefHasUserValue("version") ? Tabmix.prefs.getCharPref("version") : "";

      let vCompare = function(a, b) Services.vc.compare(a, b) <= 0;
      if (oldVersion) {
        // 2013-08-18
        if (vCompare(oldVersion, "0.4.1.1pre.130817a") &&
            Services.prefs.prefHasUserValue("browser.tabs.loadDivertedInBackground"))
          Tabmix.prefs.setBoolPref("loadExternalInBackground", true);
      }

      let subs = function(str) str.substring(0, str.length-1);
      if (currentVersion != oldVersion)
        Tabmix.prefs.setCharPref("version", currentVersion);
      let showNewVersionTab = currentVersion != oldVersion &&
        (!isNaN(currentVersion.substr(-1)) || subs(currentVersion) != subs(oldVersion))
      if (showNewVersionTab) {
        // open Tabmix page in a new tab
        window.setTimeout(function() {
          let defaultChanged = "";
          let showComment = oldVersion ? Services.vc.compare(oldVersion, "0.4.0.2pre.120330a") <= 0 : false;
          if (showComment && (_loadOnNewTab || _replaceLastTabWith))
            defaultChanged = "&newtabpage";
          let b = Tabmix.getTopWin().gBrowser;
          b.selectedTab = b.addTab("http://tmp.garyr.net/version_update2.htm?version=" + currentVersion + defaultChanged);
          b.selectedTab.loadOnStartup = true;
        },1000);
        // noting more to do at the moment
      }
    }
    AddonManager.getAddonByID("{dc572301-7619-498c-a57d-39143191b318}", function(aAddon) {
      try {
        getVersion(aAddon.version);
      } catch (ex) {Tabmix.assert(ex);}
    })

    // block item in tabclicking options that are not in use
    this.blockedValues = [];
    if (!("SessionSaver" in window && window.SessionSaver.snapBackTab))
      this.blockedValues.push(12);
    var isIE = ("IeView" in window && window.IeView.ieViewLaunch) ||
               (Tabmix.extensions.gIeTab && window[Tabmix.extensions.gIeTab.obj].switchTabEngine) ||
               ("ieview" in window && window.ieview.launch);
    if (!isIE)
      this.blockedValues.push(21);
    if (!document.getElementById("Browser:BookmarkAllTabs"))
      this.blockedValues.push(26);
    this.updateTabClickingOptions();

    // capture gfx.direct2d.disabled value on first window
    // see getter at TabmixSvc
    TabmixSvc.direct2dDisabled;

    // verify that all the prefs exist .....
    this.addMissingPrefs();
  },

  updateTabClickingOptions: function() {
    var c = ["dblClickTab", "middleClickTab", "ctrlClickTab", "shiftClickTab", "altClickTab"
                  ,"dblClickTabbar", "middleClickTabbar", "ctrlClickTabbar", "shiftClickTabbar", "altClickTabbar"];
    for (let i = 0; i < c.length; i++)
      this.blockTabClickingOptions("extensions.tabmix." + c[i]);
  },

  blockTabClickingOptions: function(prefName) {
    if (this.blockedValues.indexOf(Services.prefs.getIntPref(prefName)) > -1) {
      if (Services.prefs.prefHasUserValue(prefName))
        Services.prefs.clearUserPref(prefName);
      else
        Services.prefs.setIntPref(prefName, 0);
    }
  },

  addMissingPrefs: function() {
    // add missing preference to the default branch
    let prefs = Services.prefs.getDefaultBranch("");

    /* 2012-01-26
      from firefox 12 we use "browser.newtab.url" instead of extensions.tabmix.newtab.url
      and extensions.tabmix.replaceLastTabWith.newtab.url
    */
    if (Tabmix.isVersion(120))
      prefs.setCharPref("extensions.tabmix.replaceLastTabWith.newtab.url", "about:newtab");
    else {
      prefs.setCharPref("extensions.tabmix.newtab.url", "about:blank");
      prefs.setCharPref("extensions.tabmix.replaceLastTabWith.newTabUrl", "about:blank");
    }
  }

}

var TabmixProgressListener = {
  startup: function TMP_PL_startup(tabBrowser) {
    // check the current window.  if we're in a popup, don't init this progressListener
    if (window.document.documentElement.getAttribute("chromehidden"))
      return;
    Tabmix.changeCode(gBrowser, "gBrowser.setTabTitleLoading")._replace(
      'aTab.label = this.mStringBundle.getString("tabs.connecting");',
      'if (TabmixTabbar.hideMode != 2 && TabmixTabbar.widthFitTitle && !aTab.hasAttribute("width")) \
         aTab.setAttribute("width", aTab.getBoundingClientRect().width); \
       $&'
    ).toCode();
    this.listener.mTabBrowser = tabBrowser;
    tabBrowser.addTabsProgressListener(this.listener);
  },

  listener: {
    mTabBrowser: null,
    showProgressOnTab: false,
    onProgressChange: function (aBrowser, aWebProgress, aRequest,
                                aCurSelfProgress, aMaxSelfProgress,
                                aCurTotalProgress, aMaxTotalProgress) {
      if (!this.showProgressOnTab || TabmixTabbar.hideMode == 2 || !aMaxTotalProgress)
        return;
      var percentage = Math.ceil((aCurTotalProgress * 100) / aMaxTotalProgress);
      if (percentage > 0 && percentage < 100)
        this.mTabBrowser.getTabForBrowser(aBrowser).setAttribute("tab-progress", percentage);
    },

    onStateChange: function TMP_onStateChange(aBrowser, aWebProgress, aRequest, aStateFlags, aStatus) {
      let tab = this.mTabBrowser.getTabForBrowser(aBrowser);
      const nsIWebProgressListener = Ci.nsIWebProgressListener;
      if (tab.hasAttribute("_tabmix_load_bypass_cache") &&
          (aStateFlags & nsIWebProgressListener.STATE_START)) {
        tab.removeAttribute("_tabmix_load_bypass_cache");
        aRequest.loadFlags = aRequest.loadFlags | aRequest.LOAD_BYPASS_CACHE;
      }
      if (aStateFlags & nsIWebProgressListener.STATE_START &&
          aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
        let url = aRequest.QueryInterface(Ci.nsIChannel).URI.spec;
        if (url == "about:blank") {
          tab.removeAttribute("busy");
          tab.removeAttribute("progress");
          this.mTabBrowser.setTabTitle(tab);
        }
        // this code run after setTabTitleLoading, so we must set tab width on setTabTitleLoading
        // at this stage only unhide the button if needed.
        else if (!(aStateFlags & nsIWebProgressListener.STATE_RESTORING) &&
              this.mTabBrowser.tabContainer.getAttribute("closebuttons") == "noclose") {
          let tabsCount = this.mTabBrowser.visibleTabs.length;
          if (tabsCount == 1)
            this.mTabBrowser.tabContainer.adjustTabstrip(true, url);
        }
      }
      else if (aStateFlags & nsIWebProgressListener.STATE_STOP &&
               aStateFlags & nsIWebProgressListener.STATE_IS_NETWORK) {
        let tabsCount = this.mTabBrowser.visibleTabs.length;
        if (tabsCount == 1)
          this.mTabBrowser.tabContainer.adjustTabstrip(true);
        tab.removeAttribute("tab-progress");
        let uri = aRequest.QueryInterface(Ci.nsIChannel).URI.spec;
        if (!Tabmix.isBlankPageURL(uri) && uri.indexOf("newTab.xul") == -1) {
          aBrowser.tabmix_allowLoad = !tab.hasAttribute("locked");
          if (Tabmix.prefs.getBoolPref("unreadTabreload") && tab.hasAttribute("visited") &&
                !tab.hasAttribute("dontremovevisited") && tab.getAttribute("selected") != "true")
            tab.removeAttribute("visited");
        }
        // see gBrowser.openLinkWithHistory in tablib.js
        if (tab.hasAttribute("dontremovevisited"))
          tab.removeAttribute("dontremovevisited")

        if (!tab.hasAttribute("busy")) {
          TabmixSessionManager.tabLoaded(tab);
          // we need to remove width from tabs with url label from here
          if (tab.hasAttribute("width"))
            tablib.onTabTitleChanged(tab);
        }
      }
      if ((aStateFlags & nsIWebProgressListener.STATE_IS_WINDOW) &&
            (aStateFlags & nsIWebProgressListener.STATE_STOP)) {
        if (tab.autoReloadURI)
          Tabmix.autoReload.onTabReloaded(tab, aBrowser);

        // disabled name for locked tab, so locked tab don't get reuse
        if (tab.getAttribute("locked") && aBrowser.contentWindow.name)
          aBrowser.contentWindow.name = "";
      }
    }
  }
}
