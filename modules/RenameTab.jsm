var EXPORTED_SYMBOLS = ["RenameTab"];

let RenameTab = {
  window: null,
  panel: null,
  data: {},
  _element: function(aID) {
    return this.window.document.getElementById(aID);
  },

  editTitle: function(aTab) {
    if (this.panel && this.panel.state != "closed")
      this.hidePopup();

    this.window = aTab.ownerDocument.defaultView;
    var gBrowser = this.window.gBrowser;

    this.data.tab = aTab = aTab.localName == "tab" ? aTab : gBrowser.mCurrentTab;
    var browser = gBrowser.getBrowserForTab(aTab);
    this.data.url = browser.contentDocument.baseURI || browser.currentURI.spec;
    var title = this.window.TMP_Places.getTitleFromBookmark(this.data.url,
        browser.contentDocument.title, aTab.getAttribute("tabmix_bookmarkId"))
    this.data.docTitle = title || gBrowser.mStringBundle.getString("tabs.emptyTabTitle");
    this.data.modified = aTab.getAttribute("label-uri") || null;
    if (this.data.modified == this.data.url || this.data.modified == "*")
      this.data.value = aTab.getAttribute("fixed-label");
    else
      this.data.value = this.data.docTitle;

    this.data.permanently = null;

    this.showPanel();
  },

  showPanel: function TMP_renametab_showPanel() {
    var popup = this._element("tabmixRenametab_panel");
    if (popup) {
      if (popup._overlayLoaded) {
        this.panel = popup;
        this._doShowPanel();
      }
      return;
    }

    popup = this.window.document.createElement("panel");
    popup._overlayLoaded = false;
    popup.id = "tabmixRenametab_panel";
    this._element("mainPopupSet").appendChild(popup);
    this.window.document.loadOverlay(
      "chrome://tabmixplus/content/minit/renameTab.xul",
      (function (aSubject, aTopic, aData) {
        popup._overlayLoaded = true;
        popup.hidden = false;
        this.panel = popup;
        this._doShowPanel();
      }).bind(this)
    );
  },

  _doShowPanel: function() {
    var popup = this.panel;
    // dock the panel to the tab icon when possible, otherwise show the panel
    // at screen center
    if (this.window.gBrowser.tabContainer.mTabstrip.isElementVisible(this.data.tab))
      popup.openPopup(this.data.tab, "bottomcenter topleft");
    else {
      let screen = this.window.screen;
      let width = popup.boxObject.width || 330;
      let height = popup.boxObject.height || 215;
      popup.openPopupAtScreen(screen.availLeft + (screen.availWidth - width) / 2,
          screen.availTop + (screen.availHeight - height) / 2, false);
      if (popup.boxObject.width != width) {
        popup.moveTo(screen.availLeft + (screen.availWidth - popup.boxObject.width) / 2,
            screen.availTop + (screen.availHeight - popup.boxObject.height) / 2);
      }
    }

    var image = this.data.tab.linkedBrowser.mIconURL || "chrome://tabmixplus/skin/tmp.png";
    this._element("tabmixRenametab_icon").setAttribute("src", image);
    this._element("tabmixRenametab_titleField").value = this.data.value;
    this._element("tabmixRenametab_defaultField").value = this.data.docTitle;
    this.window.Tabmix.setItem(popup, "modified", this.data.modified);
    if (this.data.modified)
      this._element("tabmixRenametab_checkbox").checked = this.data.modified == "*";
  },

  resetTitle: function() {
    this.data.value = this.data.docTitle;
    this.update(true);
  },

  update: function(aReset) {
    var data = this.data;
    var tab = data.tab;
    var label = data.value;
    var resetDefault = aReset || (label == data.docTitle && !data.permanently);
    var url = resetDefault ? null : data.permanently ? "*" : data.url;

    var win = this.window;
    win.Tabmix.setItem(tab, "fixed-label", resetDefault ? null : label);
    win.Tabmix.setItem(tab, "label-uri", url);
    win.TabmixSessionManager.updateTabProp(tab);

    if (tab.getAttribute("label") != label) {
      tab.setAttribute("label", label);
      let gBrowser = this.window.gBrowser;
      gBrowser._tabAttrModified(tab);
      if (win.TabmixTabbar.widthFitTitle) {
        win.TabmixTabbar.updateScrollStatus();
        win.TabmixTabbar.updateBeforeAndAfter();
      }
      if (tab.selected)
        gBrowser.updateTitlebar();
    }

    this.hidePopup();
  },

  onpopupshown: function(aEvent) {
    if (aEvent.target == this.panel) {
      var textbox = this._element("tabmixRenametab_titleField");
      textbox.focus();
      textbox.select();
    }
  },

  onpopuphidden: function(aEvent) {
    if (aEvent.originalTarget == this.panel) {
      this.window = null;
      this.panel = null;
      this.data = {};
    }
  },

  onNewTitle: function(aTitle) {
    this.data.value = aTitle;
    if (!this.data.modified)
      this.window.Tabmix.setItem(this.panel, "modified", aTitle != this.data.docTitle || null);
  },

  hidePopup: function() {
    this.panel.hidePopup();
  }
}