var gMenuPane = {
  init: function () {
    gSetTabIndex.init('menu');

    $("pinTab").label = gPrefWindow.pinTabLabel;
    $("togglePinTab").setAttribute("label", gPrefWindow.pinTabLabel);

    var browserWindow = Tabmix.getTopWin();
    // check if bookmark item in tab context menu
    Tabmix.setItem("bmMenu", "hidden", !(browserWindow.document.getElementById("context_bookmarkAllTabs")));

    gPrefWindow.initUndoCloseBroadcaster();
    gPrefWindow.initSingleWindowBroadcaster();
    this.setInverseLinkLabel();

    if (!Shortcuts.keys.browserReload.id)
      $("browserReload").hidden = true;
    this.initializeShortcuts();
    this.updateSessionShortcuts();
    this.setSlideShowLabel();
    let paneMenu = $("paneMenu");
    if (paneMenu.hasAttribute("editSlideShowKey")) {
      paneMenu.removeAttribute("editSlideShowKey")
      setTimeout(function(self) {self.editSlideShowKey();},0, this);
    }

    gCommon.setPaneWidth("paneMenu");
  },

  initializeShortcuts: function() {
    if (Shortcuts.prefsChangedByTabmix)
      return;

    let newValue = $("pref_shortcuts").value;
    let shortcuts = $("shortcut-group");
    if (newValue == shortcuts.value)
      return;
    shortcuts.value = newValue;
    shortcuts.keys = Tabmix.JSON.parse(newValue);
    let callBack = function(shortcut) shortcut.id && shortcut.valueFromPreferences(Shortcuts.keys[shortcut.id]);
    this.updateShortcuts(shortcuts, callBack)
  },

  _slideShow: "",
  updateShortcuts: function (aShortcuts, aCallBack) {
    let boxes = Array.filter(aShortcuts.childNodes, aCallBack);
    $("shortcuts-panel").setAttribute("usedKeys", boxes.length > 0);
    if (this._slideShow != $("shortcut-group").keys.slideShow) {
      this._slideShow = $("shortcut-group").keys.slideShow;
      this.setSlideShowLabel();
    }
  },

  setSlideShowLabel: function () {
    let slideShow = $("slideShow");
    let label = slideShow.disabled ? "??" : getFormattedKey(slideShow.key);
    $("slideDelayLabel").value = slideShow.getAttribute("_label").replace("#1", label);
    gPrefWindow.setDisabled("obs_slideDelay", slideShow.disabled);
  },

  editSlideShowKey: function () {
    $("menu").selectedIndex = 3;
    let slideShow = $("slideShow");
    let item = $("hide-unused-shortcuts");
    if (!slideShow.hasAttribute("value") &&
        $("shortcuts-panel").getAttribute(item.id) == "true")
      this.toggleLinkLabel(item);
    slideShow.editBox.focus();
    $("slideshow.time").scrollIntoView();
  },

  updateSessionShortcuts: function() {
    let block = !($("pref_sessionManager") || $("pref_sessionManager1")).value ||
        Shortcuts.permanentPrivateBrowsing;
    $("saveWindow").blocked = block;
    $("saveSession").blocked = block;
  },

  // for shortcuts panel
  toggleLinkLabel: function(item) {
    var panel = $("shortcuts-panel");
    var wasShow = panel.getAttribute(item.id) == 'false';
    item.value = item.getAttribute(wasShow ? 'show' : 'hide');
    panel.setAttribute(item.id, wasShow);
  },

  // update item showInverseLink label in menu pane
  // when "Links" in Events > Tab Focus changed
  setInverseLinkLabel: function() {
    var showInverseLink = $("showInverseLink");
    var val = ($("pref_selectTab") || $("pref_selectTab1")).value;
    var label = showInverseLink.getAttribute((val ? "bg" : "fg") + "label");
    showInverseLink.setAttribute("label", label);
  }
}
