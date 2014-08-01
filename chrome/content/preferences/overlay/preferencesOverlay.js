"use strict";

var gTabMix_preferencesOverlay = {
  id: function(id) {return document.getElementById(id);},
  incontentInit: function gTabMix_preferencesOverlay_incontentInit(aEvent) {
    var box = this.id("linkTargeting");
    box.collapsed = true;
    box.parentNode.insertBefore(this.id("tabmixplusBox"), box);

    var warnOnCloseWindow = this.id("warnOnCloseWindow");
    var warnCloseMultiple = this.id("warnCloseMultiple");
    warnCloseMultiple.setAttribute("preference", "extensions.tabmix.tabs.warnOnClose");
    warnOnCloseWindow.parentNode.insertBefore(warnCloseMultiple, warnOnCloseWindow);

    box = this.id("showTabsInTaskbar") || this.id("switchToNewTabs");
    box.parentNode.appendChild(this.id("hideTabbarBox"));

    var showTabBar = this.id("showTabBar");
    if (showTabBar)
      showTabBar.collapsed = true;

    if (Tabmix.isVersion(260)) {
      let boxes = ["tabmixplusBox", "btn_tabmixplus", "generalWindowOpenBox",
                   "warnOnCloseWindow", "warnOnCloseProtected", "hideTabbarBox"];
      boxes.forEach(function(id) {
        let item = this.id(id);
        item.removeAttribute("data-category");
        item.hidden = false;
        item.classList.remove("indent")
        item.classList.add("incontent_paneGeneral")
      }, this)
    }

    this.onPaneMainLoad();
    setTimeout(function(self) {
      self.initPaneTabsOptions();
    }, 0, this);
  },

   lastSelected: "",
   currentPane: "",
   init: function gTabMix_preferencesOverlay_init(aEvent) {
      var prefWindow = aEvent.target.documentElement;
      this.currentPane = prefWindow.lastSelected;
      this.onPaneLoad(prefWindow.lastSelected);

      Tabmix.changeCode(prefWindow, "prefWindow.showPane")._replace(
        'if (!aPaneElement.loaded) {', ''
      )._replace(
        'OverlayLoadObserver.prototype',
        'if (!aPaneElement.loaded) {\
         $&'
      )._replace(
        'this._outer._selectPane(this._pane);',
        '$& \
         gTabMix_preferencesOverlay.onPaneLoad(this._pane.id);'
      ).toCode();

      Tabmix.changeCode(window, "openLinkIn")._replace(
        'var w = getTopWin();',
        '$& \
         if (w && where == "window" && Tabmix.prefs.getBoolPref("singleWindow")) where = "tab";'
      ).toCode();

   },

   onPaneLoad: function gTabMix_preferencesOverlay_onPaneLoad(aPaneID) {
      this.lastSelected = this.currentPane;
      switch (aPaneID) {
         case "paneTabs":
            this.loadOverlay();
         break;
         case "paneMain":
            this.onPaneMainLoad();
         break;
         default:
      }
   },

/* ........ paneTabs .............. */
   loadOverlay: function () {
      function OverlayLoadObserver() { }
      OverlayLoadObserver.prototype = {
         _outer: this,
         observe: function (aSubject, aTopic, aData) {
            this._outer._afterOverlayLoaded();
         }
      };
      var obs = new OverlayLoadObserver();
      document.loadOverlay("chrome://tabmixplus/content/preferences/overlay/tab_panel.xul", obs);
   },

   _afterOverlayLoaded: function () {
      this.initPaneTabsOptions();

      // fix panel height
      var docElt = document.documentElement;
      if (docElt._shouldAnimate && this.lastSelected == "paneTabs")
        window.sizeToContent();
      else {
        let paneTabs = document.getElementById("paneTabs");
        paneTabs._content.style.height = "";
        docElt.lastSelected = this.lastSelected;
        docElt._selectPane(paneTabs);
      }
   },

   initPaneTabsOptions: function () {
      document.getElementById("_hideTabbar").value = document.getElementById("extensions.tabmix.hideTabbar").value;
      document.getElementById("generalWindowOpen").value = document.getElementById("browser.link.open_newwindow").value;
      document.getElementById("warnCloseMultiple").checked = document.getElementById("extensions.tabmix.tabs.warnOnClose").value;
      document.getElementById("warnOnCloseWindow").checked = document.getElementById("browser.tabs.warnOnClose").value;
      document.getElementById("warnOnCloseProtected").checked = document.getElementById("extensions.tabmix.protectedtabs.warnOnClose").value;
      var singleWindowMode = Tabmix.prefs.getBoolPref("singleWindow");
      if (singleWindowMode)
         document.getElementById("linkTargetWindow").disabled = true;
   },

   showTabmixOptions: function (panel) {
      var windowMediator = Services.wm;
      var browserWindow = windowMediator.getMostRecentWindow('navigator:browser');

      if (!browserWindow) {
         let tabmixopt = windowMediator.getMostRecentWindow("mozilla:tabmixopt");
         if (tabmixopt)
            tabmixopt.close();
         let title = TabmixSvc.getString("tabmixoption.error.title");
         let msg = TabmixSvc.getString("tabmixoption.error.msg");
         Services.prompt.alert(window, title, msg);
      }
      else
         browserWindow.Tabmix.openOptionsDialog(panel);
   },

/* ........ paneMain .............. */
   onPaneMainLoad: function () {
     var button = document.getElementById("tabmixSessionManager");
     if (button)
       return;

     if (!Tabmix.isVersion(180))
     Tabmix.changeCode(gMainPane, "gMainPane.showAddonsMgr")._replace(
       'openUILinkIn("about:addons", "window");',
       'var w = Tabmix.getTopWin();\
       if (w) w.BrowserOpenAddonsMgr();\
       else $&', {silent: true}
     ).toCode();

     button = document.createElement("button");
     button.id = "tabmixSessionManager";
     button.setAttribute("label", tabmixButton_label);
     button.setAttribute("oncommand", "gTabMix_preferencesOverlay.showTabmixOptions('paneSession');");
     button.setAttribute("class", "tabmixplus-button");
     var menuList = document.getElementById("browserStartupPage");
     var hBox = menuList.parentNode;
     var spacer = document.createElement("spacer");
     spacer.setAttribute("flex", "1");
     hBox.insertBefore(spacer, menuList);
     hBox.insertBefore(button, menuList);
     hBox.classList.add("whenBrowserStartBox")

     var preferences = document.getElementById("mainPreferences");
     var preference = document.createElement("preference");
     preference.setAttribute("id", "tabmix.sm");
     preference.setAttribute("name", "extensions.tabmix.sessions.manager");
     preference.setAttribute("type", "bool");
     preference.setAttribute("onchange", "gTabMix_preferencesOverlay.onStartupPrefchanged();");
     preferences.appendChild(preference);

     preference = document.createElement("preference");
     preference.setAttribute("id", "tabmix.cr");
     preference.setAttribute("name", "extensions.tabmix.sessions.crashRecovery");
     preference.setAttribute("type", "bool");
     preference.setAttribute("onchange", "gTabMix_preferencesOverlay.onStartupPrefchanged();");
     preferences.appendChild(preference);
     this.onStartupPrefchanged();
   },

   onStartupPrefchanged: function () {
     var tabmixSession =  document.getElementById('tabmix.sm').value || document.getElementById('tabmix.cr').value;
     document.getElementById("browserStartupPage").collapsed = tabmixSession;
     var button = document.getElementById("tabmixSessionManager");
     button.collapsed = !tabmixSession;
     button.previousSibling.collapsed = !tabmixSession;
     document.getElementById("startupGroup").setAttribute("tabmixbutton", tabmixSession);
   }

}
