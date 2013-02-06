/***** Preference Dialog Functions *****/
const Cc = Components.classes;
const Ci = Components.interfaces;
const pBranch = Ci.nsIPrefBranch;
const PrefFn = {0: "", 32: "CharPref", 64: "IntPref", 128: "BoolPref"};

function $(id) document.getElementById(id);

// Bug 455553 - New Tab Page feature - landed on 2012-01-26 (Firefox 12)
// for support firefox 4.0-11.0
XPCOMUtils.defineLazyGetter(window, "newTabURLpref", function() {
  return Tabmix.getTopWin().Tabmix.newTabURLpref;
});

var gSetTabIndex = {
  _inited: [],
  tabSelectionChanged: function (event) {
    var tabbox = event.target.parentNode;
    if (event.target.localName != "tabs" || !this._inited[tabbox.id])
      return;
    var preference = $("pref_" + tabbox.id);
    preference.valueFromPreferences = tabbox.selectedIndex;
  },

  init: function (id) {
    var tabbox = $(id);
    var preference = $("pref_" + tabbox.id);
    if (preference.value !== null)
      tabbox.selectedIndex = preference.value;
    this._inited[id] = true;
  }
}

var gPrefs;
var radiogroups;

// load all preferences into the dialog
function TM_EMinit()
{
   gPrefs =  document.getElementsByAttribute("prefstring", "*");
   radiogroups = document.getElementsByTagName("radiogroup");

   getTab();
  // show groupbox if incompatible extensions exist in this profile
  if (prevWindow.getExtensions().length == 0)
    $("incompatible").collapsed = true;

  // add EventListener when we start
  window.addEventListener("command", TM_enableApply, false);
  window.addEventListener("input", TM_enableApply, false);

  // prevent non intiger key in int text box
  window.addEventListener("keypress", keyPressInText, false);

  // create saved Session popup menu
  var popup = $("onStart.popup");
    TabmixSessionManager.createMenuForDialog(popup);

  // update tabclicking items that aren't change by tabmix
  TM_Options.setItem("snapBack", "hidden", !(prevWindow.SessionSaver && prevWindow.SessionSaver.snapBackTab));
  TM_Options.setItem("ieView", "hidden", !(prevWindow.IeView && prevWindow.IeView.ieViewLaunch));

  // check if book mark item in tab context menu
  TM_Options.setItem("bmMenu", "hidden", !(prevWindow.document.getElementById("tm-bookmarkAllTabs")));
  // check if book "Browser:BookmarkAllTabs" command exist
  TM_Options.setItem("bmTabsCommand", "hidden", !(prevWindow.document.getElementById("Browser:BookmarkAllTabs")));

  // update pref for 'places'
  if (prevWindow.gIsPlaces) {
    $("openBookmarks").setAttribute("label", $("selectTabBH").getAttribute("label"));
    $("openHistory").hidden = true;
  }

  TM_setElements(false, true);
}

// save all preferences entered into the dialog
function TM_EMsave(onApply)
{
  // we only need to save if apply is enabled
  if (!onApply && document.documentElement.getButton("extra1").disabled)
    return true;

  // set flag to prevent TabmixTabbar.updateSettings from run for each change
  Tabmix.prefs.setBoolPref("setDefault", true);

  TM_Options.singleWindow( $("singleWindow").checked );
  TM_verifyWidth();

  document.documentElement.getButton('accept').focus()
  document.documentElement.getButton("extra1").disabled = true;

  if (!("undefined" in applyData)) {
    for (var _pref in applyData)
      setPrefByType(_pref, applyData[_pref]);
  }
  else {
    // this part is only if the applayData fail for some unknown reason
    // we don't supposed to get here
    for (var i = 0; i < gPrefs.length; ++i )
      setPrefByType(gPrefs[i].getAttribute("prefstring"), gPrefs[i].value);
  }

  // set saved sessionpath if loadsession >=0
  var val = Tabmix.prefs.getIntPref("sessions.onStart.loadsession");
  var popup = $("onStart.popup");
  var pref = "sessions.onStart.sessionpath";
  Tabmix.prefs.setCharPref(pref, popup.getElementsByAttribute("value", val)[0].getAttribute("session"));

  applyData = [];
  Tabmix.prefs.clearUserPref("setDefault"); // this trigger TabmixTabbar.updateSettings

  callUpdateSettings();

  Services.prefs.savePrefFile(null); // store the pref immediately
  return true;
}

function callUpdateSettings() {
  var pref = "PrefObserver.error";
  if (Tabmix.prefs.prefHasUserValue(pref) && Tabmix.prefs.getBoolPref(pref)) {
    var wnd, enumerator = Tabmix.windowEnumerator();
    while (enumerator.hasMoreElements()) {
      wnd = enumerator.getNext();
      wnd.TabmixTabbar.updateSettings();
    }
  }
}

function TM_verifyWidth() {
   var minWidth = $("minWidth");
   var maxWidth = $("maxWidth");

   var minValue = minWidth.value;
   var maxValue = maxWidth.value;

   if (maxValue - minValue < 0) {
      minWidth.value = maxValue;
      maxWidth.value = minValue;
   }

   if (minWidth.value < 22)
     minWidth.value = 30;

   if (minValue != minWidth.value)
      updateApplyData(minWidth);

   if (maxValue != maxWidth.value)
      updateApplyData(maxWidth);
}

var TM_Options = {

   setRadioFromBoolPref: function(prefId)
   {
//Tabmix.log("setRadioFromBoolPref " + prefId)
      var preference = $(prefId);
      return preference.value ? 1 : 0;
   },

   setBoolPrefFromRadio: function(itemId)
   {
//Tabmix.log("setBoolPrefFromRadio " + itemId);
      var radiogroupItem = $(itemId);
      return radiogroupItem.value == 1;
   },

   _prefs: null,
   get prefs() {
alert("don't use this");
      if (!this._prefs)
         this._prefs = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);

      return this._prefs;
   },

  initBroadcasters: function(paneID, start) {
///XXX TODO fix me
    var broadcasters = $(paneID + ":Broadcaster");
    for (var i = 0; i < broadcasters.childNodes.length; ++i ) {
      var _id = broadcasters.childNodes[i].id.replace("obs_", "");
      this.disabled(_id, start);
    }
  },

  // init broadcaster for obs_undoClose if events pane did not loaded yet
  // we call it from panes : session, menu, mouse
  initUndoCloseBroadcaster: function() {
    if (!$("undoClose") && !Tabmix.prefs.getBoolPref("undoClose"))
      this.setDisabled("obs_undoClose", true);
  },

  // init broadcaster for obs_singleWindow if links pane did not loaded yet
  // we call it from panes : menu, mouse
  initSingleWindowBroadcaster: function() {
    // we use inverseDependency in singleWindow
    if (!$("singleWindow") && Tabmix.prefs.getBoolPref("singleWindow"))
      this.setDisabled("obs_singleWindow", true);
  },

  disabled: function(itemOrId, start) {
try {
    var item = typeof(itemOrId) == "string" ? $(itemOrId) : itemOrId;
//XXX if item not exist ????
    var val;
    if (item.hasAttribute("disableObserver"))
      val = true;
    else
      val = item.getAttribute("inverseDependency") ? item.checked : !item.checked;
    if (start && !val)
      return;
    this.setDisabled("obs_" + item.id, val);
} catch (ex) {Tabmix.assert(ex);}
  },

  setDisabled: function(id, val) {
    if (val == true)
      this.setItem(id, "disabled" , val);
    else {
      // remove disabled from all observers,
      // we can't edit textbox-input with disabled=null or disabled=false
      // textbox-input inherits the dislabled attribute from the textbox

      // all broadcaster has no disabled attribute at startup
      var aBroadcaster = $(id);
      if (aBroadcaster.hasAttribute("disabled")) {
        aBroadcaster.removeAttribute("disabled");
      }
    }
  },

   // Set given attribute of specified item.
   // If the value is null, then it removes the attribute
   // (which works nicely for the disabled attribute).
  setItem: function (id, attrib, val) {
    var item = $(id);
    if (val == null) {
      item.removeAttribute(attrib);
      return;
    }

    if (typeof(val) == "boolean")
      val = val ? "true" : "false";

    if (item.getAttribute(attrib) != val)
      item.setAttribute(attrib, val);
  }

}

function getPrefByType(prefName) {
  try {
    var fn = PrefFn[Services.prefs.getPrefType(prefName)];
    return Services.prefs["get" + fn](prefName);
  } catch (ex) {
    Tabmix.log("can't read preference " + prefName + "\n" + ex, true);
  }
  return null;
}

function setPrefByType(prefName, newValue, atImport) {
  try {
    _setPrefByType(prefName, newValue, atImport)
  } catch (ex) {
    Tabmix.log("can't write preference " + prefName + "\nvalue " + newValue, true);
  }
}

function _setPrefByType(prefName, newValue, atImport) {
  let prefType = Services.prefs.getPrefType(prefName);
  // when we import from old saved file, we need to replace old pref that are not in use.
  // we also check for locked pref for the case user locked pref that we replaced
  if (atImport && (prefType == Services.prefs.PREF_INVALID ||
      Services.prefs.prefIsLocked(prefName))) {
    switch (prefName) {
    // in 0.3.0.605 we changed tab color from old pref to new pref
    // old pref "extensions.tabmix.currentColor" type integer
    // new pref "extensions.tabmix.currentColorCode" type string
    case "extensions.tabmix.currentColor":
    case "extensions.tabmix.unreadColor":
    case "extensions.tabmix.progressColor":
      var colorCodes = ["#CF1919", "#0E36EF", "#DDDF0D", "#3F8F3E", "#E066FF", "#86E7EF",
        "#FFFFFF", "#7F7F7F", "#000000", "#EF952C", "#FF82AB", "#7F4C0F", "#AAAAFF"]
      newValue = colorCodes[newValue];
      prefName = prefName + "Code";
    // in 0.3.7.4 2008-12-24 we combined all style pref into one per type
    // extensions.tabmix.styles.[TYPE NAME]
    case "extensions.tabmix.boldUnread":
    case "extensions.tabmix.italicUnread":
    case "extensions.tabmix.underlineUnread":
    case "extensions.tabmix.boldCurrent":
    case "extensions.tabmix.italicCurrent":
    case "extensions.tabmix.underlineCurrent":
    case "extensions.tabmix.unreadColorCode":
    case "extensions.tabmix.currentColorCode":
    case "extensions.tabmix.progressColorCode":
    case "extensions.tabmix.useCurrentColor":
    case "extensions.tabmix.useUnreadColor":
    case "extensions.tabmix.useProgressColor":
      var pref = prefName.toLowerCase().replace(/extensions.tabmix.|color/g,"")
                        .replace(/italic|bold|underline/g, ",$&,")
                        .replace("use", ",text,")
                        .replace("code", ",textColor,")
                        .split(",");
      var styleName, attrib;
      [styleName, attrib] = prefName.indexOf("Code") > -1 ? [pref[0], pref[1]] : [pref[2], pref[1]];
      if (styleName == "progress") {
        attrib = attrib.replace("text", "bg");
        styleName += "Meter"
      }
      else
        styleName += "Tab";
      oldStylePrefs[styleName][attrib] = newValue;
      oldStylePrefs.found = true;
      return;
    // changed at 2008-02-26
    case "extensions.tabmix.undoCloseCache":
      Services.prefs.setIntPref("browser.sessionstore.max_tabs_undo", newValue);
      return;
    // changed at 2008-08-17
    case "extensions.tabmix.opentabfor.search":
      Services.prefs.setBoolPref("browser.search.openintab", /true/i.test(newValue));
      return;
    // changed at 2008-09-23
    case "extensions.tabmix.keepWindow":
      Services.prefs.setBoolPref("browser.tabs.closeWindowWithLastTab", !(/true/i.test(newValue)));
      return;
    // changed at 2008-09-28
    case "browser.ctrlTab.mostRecentlyUsed":
    case "extensions.tabmix.lasttab.handleCtrlTab":
      Services.prefs.setBoolPref("browser.ctrlTab.previews", /true/i.test(newValue));
      return;
    // 2008-11-29
    case "extensions.tabmix.maxWidth":
    case "extensions.tabmix.tabMaxWidth": // 2012-06-22
      Services.prefs.setIntPref("browser.tabs.tabMaxWidth", newValue);
      return;
    // 2008-11-29
    case "extensions.tabmix.minWidth":
    case "extensions.tabmix.tabMinWidth": // 2012-06-22
      Services.prefs.setIntPref("browser.tabs.tabMinWidth", newValue);
      return;
    // 2009-01-31
    case "extensions.tabmix.newTabButton.leftside":
      Tabmix.prefs.setIntPref("newTabButton.position", /true/i.test(newValue) ? 0 : 2);
      return;
    // 2009-10-10
    case "extensions.tabmix.windows.warnOnClose":
      Tabmix.prefs.setBoolPref("tabs.warnOnClose", Services.prefs.getBoolPref("browser.tabs.warnOnClose"));
      Services.prefs.setBoolPref("browser.tabs.warnOnClose", /true/i.test(newValue));
      return;
    // 2010-03-07
    case "extensions.tabmix.extraIcons":
      Services.prefs.setBoolPref(prefName + ".locked", /true/i.test(newValue));
      Services.prefs.setBoolPref(prefName + ".protected", /true/i.test(newValue));
      return;
    // 2010-06-05
    case "extensions.tabmix.tabXMode":
      // in old version we use tabXMode = 0 to disable the button
      if (newValue < 1 || newValue > 5)
        newValue = 1;
      Tabmix.prefs.setIntPref("tabs.closeButtons", newValue);
      return;
    case "extensions.tabmix.tabXMode.enable":
      Tabmix.prefs.setBoolPref("tabs.closeButtons.enable", /true/i.test(newValue));
      return;
    case "extensions.tabmix.tabXLeft":
      Tabmix.prefs.setBoolPref("tabs.closeButtons.onLeft", /true/i.test(newValue));
      return;
    case "extensions.tabmix.tabXDelay":
      Tabmix.prefs.setIntPref("tabs.closeButtons.delay", newValue);
      return;
    // 2010-09-16
    case "extensions.tabmix.speLink":
      Tabmix.prefs.setIntPref("opentabforLinks", newValue);
      return;
    // 2011-01-26
    case "extensions.tabmix.mouseDownSelect":
      Tabmix.prefs.setBoolPref("selectTabOnMouseDown", /true/i.test(newValue));
      return;
    // 2011-10-11
    case "browser.link.open_external":
      if (newValue == $("generalWindowOpen").value)
        newValue = -1;
      Services.prefs.setIntPref("browser.link.open_newwindow.override.external", newValue);
      return;
    // 2011-11-26
    case "extensions.tabmix.clickToScroll.scrollDelay":
      Services.prefs.setIntPref("toolkit.scrollbox.clickToScroll.scrollDelay", newValue);
      return;
    // 2012-01-26
    case "extensions.tabmix.newTabUrl":
      setNewTabUrl(newTabURLpref, newValue);
      return;
    case "extensions.tabmix.newTabUrl_afterLastTab":
      setNewTabUrl(replaceLastTabWithNewTabURLpref, newValue);
      return;
      // 2012-03-21
    case "extensions.tabmix.loadOnNewTab":
      Tabmix.prefs.setIntPref("loadOnNewTab.type", newValue);
      return;
    case "extensions.tabmix.replaceLastTabWith":
      Tabmix.prefs.setIntPref("replaceLastTabWith.type", newValue);
      return;
      // 2012-04-12
    case "browser.tabs.loadFolderAndReplace":
      Tabmix.prefs.setBoolPref("loadFolderAndReplace", /true/i.test(newValue));
      return;
    // 2013-01-18
    case "extensions.tabmix.disableF8Key":
    case "extensions.tabmix.disableF9Key":
      let disabled = /true/i.test(newValue) ? "d&" : "";
      let isF8 = /disableF8Key$/.test(prefName);
      let key = isF8 ? "slideShow" : "toggleFLST";
      $("shortcut-group").keys[key] = disabled + (isF8 ? "VK_F8" : "VK_F9");
      Tabmix.prefs.setCharPref("shortcuts", Tabmix.JSON.stringify($("shortcut-group").keys));
      return;
    }
  }
  switch (prefType) {
  case pBranch.PREF_BOOL:
    if (atImport) {
      newValue = /true/i.test(newValue);
      // from tabmix 0.3.6.0.080223 we use extensions.tabmix.hideTabbar
      if (prefName == "browser.tabs.autoHide") {
        newValue = newValue ? 1 : 0;
        Tabmix.prefs.setIntPref("hideTabbar", newValue);
        return;
      }
    }
    Services.prefs.setBoolPref(prefName, newValue);
    break;
  case pBranch.PREF_INT:
    if (prefName == "browser.tabs.closeButtons") {
      // we use browser.tabs.closeButtons only in 0.3.8.3
      if (newValue < 0 || newValue > 6)
        newValue = 6;
      newValue = [3,5,1,1,2,4,1][newValue];
      Tabmix.prefs.setIntPref("tabs.closeButtons", newValue);
      return;
    }
    Services.prefs.setIntPref(prefName, newValue);
    break;
  case pBranch.PREF_STRING:
    // in prev version we use " " for to export string to file
    if (atImport && newValue.indexOf('"') == 0)
      newValue = newValue.substring(1,newValue.length-1);
    if (newTabURLpref == "browser.newtab.url") {
      if (prefName == "extensions.tabmix.newtab.url") {
        setNewTabUrl("browser.newtab.url", newValue);
        break;
      }
      if (prefName == "extensions.tabmix.replaceLastTabWith.newTabUrl") {
        setNewTabUrl("extensions.tabmix.replaceLastTabWith.newtab.url", newValue);
        break;
      }
    }
    Services.prefs.setCharPref(prefName, newValue);
    break;
  }
}

function setNewTabUrl(newPref, newValue) {
  if (newValue != "") {
    let nsISupportsString = Ci.nsISupportsString;
    let str = Cc["@mozilla.org/supports-string;1"].createInstance(nsISupportsString);
    str.data = newValue;
    Services.prefs.setComplexValue(newPref, nsISupportsString, str);
  }
}

function TM_setElements (restore, start) {
gPrefs = document.documentElement.getElementsByAttribute("prefstring", "*");
   for (var i = 0; i < gPrefs.length; ++i ) {
      var pref = gPrefs[i].getAttribute("prefstring");
      if (restore && Services.prefs.prefHasUserValue(pref))
         Services.prefs.clearUserPref(pref);

      gPrefs[i].value = getPrefByType(pref);
   }

   radiogroups = document.documentElement.getElementsByTagName("radiogroup");
   // this is for compatible with ff 1.0.x
   // radiogroup not set selectedIndex selectedItem by value set
   for (i = 0; i < radiogroups.length; i++)
      radiogroups[i].selectedItem.value = radiogroups[i].value;
   TM_Options.initBroadcasters(start);
}

XPCOMUtils.defineLazyGetter(window, "preferenceList", function() {
  // other settings not in extensions.tabmix. branch that we save
  let otherPrefs = ["browser.allTabs.previews","browser.ctrlTab.previews",
  "browser.link.open_newwindow","browser.link.open_newwindow.override.external",
  "browser.link.open_newwindow.restriction","browser.newtab.url",
  "browser.search.context.loadInBackground","browser.search.openintab",
  "browser.sessionstore.interval","browser.sessionstore.max_tabs_undo",
  "browser.sessionstore.postdata","browser.sessionstore.privacy_level",
  "browser.sessionstore.resume_from_crash","browser.startup.page",
  "browser.startup.page","browser.tabs.animate","browser.tabs.closeWindowWithLastTab",
  "browser.tabs.insertRelatedAfterCurrent","browser.tabs.loadBookmarksInBackground",
  "browser.tabs.loadDivertedInBackground","browser.tabs.loadInBackground",
  "browser.tabs.tabClipWidth","browser.tabs.tabMaxWidth","browser.tabs.tabMinWidth",
  "browser.tabs.warnOnClose","browser.warnOnQuit","browser.warnOnRestart",
  "toolkit.scrollbox.clickToScroll.scrollDelay","toolkit.scrollbox.smoothScroll"];

  let prefs = Services.prefs.getDefaultBranch("");
  let tabmixPrefs = Services.prefs.getChildList("extensions.tabmix.").sort();
  // filter out preference without default value
  tabmixPrefs = tabmixPrefs.filter(function(pref){
    try {
      return prefs["get" + PrefFn[prefs.getPrefType(pref)]](pref) != undefined;
    } catch (ex) { }
    return false;
  });
  return otherPrefs.concat(tabmixPrefs);
});

function defaultSetting() {
  // set flag to prevent TabmixTabbar.updateSettings from run for each change
  Tabmix.prefs.setBoolPref("setDefault", true);
  Shortcuts.prefsChangedByTabmix = true;
  this.preferenceList.forEach(function(pref) {
    if (Services.prefs.prefHasUserValue(pref))
      Services.prefs.clearUserPref(pref);
  });
  Shortcuts.prefsChangedByTabmix = false;
  Tabmix.prefs.clearUserPref("setDefault");
  Services.prefs.savePrefFile(null);

///XXX TODO finish this later
///  TMP_setButtons(true, true);
///  TM_Options.isSessionStoreEnabled(true);
}

function exportData() {
  let docElt = document.documentElement;
  if (!docElt.instantApply) {
    docElt._fireEvent("dialogaccept", docElt);
    gCommon._applyButton.disabled = true;
  }

  let patterns = this.preferenceList.map(function(pref) {
    return pref + "=" + getPrefByType(pref) + "\n";
  });
  patterns[patterns.length-1] = patterns[patterns.length-1].replace(/\n$/, "");
  patterns.unshift("tabmixplus\n");

  const nsIFilePicker = Ci.nsIFilePicker;
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  var fpCallback = function fpCallback_done(aResult) {
    if (aResult != nsIFilePicker.returnCancel) {
      let file = fp.file;
      if (!/\.txt$/.test(file.leafName.toLowerCase()))
        file.leafName += ".txt";
      if (file.exists())
        file.remove(true);
      file.create(file.NORMAL_FILE_TYPE, parseInt("0666", 8));
      let stream = Cc["@mozilla.org/network/file-output-stream;1"].
                   createInstance(Ci.nsIFileOutputStream);
      stream.init(file, 0x02, 0x200, null);
      for (let i = 0; i < patterns.length ; i++)
        stream.write(patterns[i], patterns[i].length);
      stream.close();
    }
  }

  fp.init(window, null, nsIFilePicker.modeSave);
  fp.defaultExtension = "txt";
  fp.defaultString = "TMPpref";
  fp.appendFilters(nsIFilePicker.filterText);
  fp.open(fpCallback);
}

var oldStylePrefs = {currentTab: {}, unreadTab: {}, progressMeter: {}, found: false};
function importData () {
  const nsIFilePicker = Ci.nsIFilePicker;
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  var fpCallback = function fpCallback_done(aResult) {
    if (aResult != nsIFilePicker.returnCancel) {
      let stream = Cc["@mozilla.org/network/file-input-stream;1"].
                  createInstance(Ci.nsIFileInputStream);
      stream.init(fp.file, 0x01, parseInt("0444", 8), null);
      let streamIO = Cc["@mozilla.org/scriptableinputstream;1"].
                  createInstance(Ci.nsIScriptableInputStream);
      streamIO.init(stream);
      let input = streamIO.read(stream.available());
      streamIO.close();
      stream.close();
      if (input)
        loadData(input.replace(/\r\n/g, "\n").split("\n"));
    }
  }

  fp.init(window, null, nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterText);
  if (Tabmix.isVersion(180))
    fp.open(fpCallback);
  else
    fpCallback(fp.show());
}

function loadData (pattern) {
  if (pattern[0]!="tabmixplus") {
    //  Can not import because it is not a valid file.
    alert(TabmixSvc.getString("tmp.importPref.error1"));
    return;
  }

  // set flag to prevent TabmixTabbar.updateSettings from run for each change
  Tabmix.prefs.setBoolPref("setDefault", true);

  // disable both Firefox & Tabmix session manager to prevent our prefs observer to block the change
  Tabmix.prefs.setBoolPref("sessions.manager", false);
  Tabmix.prefs.setBoolPref("sessions.crashRecovery", false);
  Services.prefs.setBoolPref("browser.sessionstore.resume_from_crash", false);
  Services.prefs.setIntPref("browser.startup.page", false);
  Services.prefs.savePrefFile(null);

  var prefName, prefValue;
  Shortcuts.prefsChangedByTabmix = true;
  for (let i = 1; i < pattern.length; i++){
    var index = pattern[i].indexOf("=");
    if (index > 0){
      prefName  = pattern[i].substring(0,index);
      prefValue = pattern[i].substring(index+1,pattern[i].length);
      setPrefByType(prefName, prefValue, true);
    }
  }
  Shortcuts.prefsChangedByTabmix = false;
  var browserWindow = Tabmix.getTopWin();
  browserWindow.gTMPprefObserver.updateTabClickingOptions();
  if (oldStylePrefs.found) {
    browserWindow.gTMPprefObserver.converOldStylePrefs("currentTab", oldStylePrefs.currentTab);
    browserWindow.gTMPprefObserver.converOldStylePrefs("unreadTab", oldStylePrefs.unreadTab);
    browserWindow.gTMPprefObserver.converOldStylePrefs("progressMeter", oldStylePrefs.progressMeter);
    oldStylePrefs = {currentTab: {}, unreadTab: {}, progressMeter: {}, found: false};
  }
  Tabmix.prefs.clearUserPref("setDefault");
/*
///XXX TODO finish this later
  TM_setElements(false);
  TMP_setButtons(true, true);

  TM_Options.isSessionStoreEnabled(true);
  callUpdateSettings();
*/
  Services.prefs.savePrefFile(null);
}

var applyData = [];
function TM_enableApply(event) {
Tabmix.log("",true)
   // if we fail once no neet to continue and we keep the apply button enable
   if ("undefined" in applyData)
      return;

   var item = event.target;
   var n = item.localName;

   // only allow event from this item to go on....
   if (item.parentNode.id == "tm-settings")
      return;
   if (n != "radio" && n != "menuitem" &&
              n != "checkbox" && n != "textbox" && n != "tabclicking")
      return;
   while(item.id != "pref-tabmix" && !item.hasAttribute("prefstring"))
      item = item.parentNode;

   if (item.hasAttribute("prefstring"))
      updateApplyData(item);
   else {
      Tabmix.log("erorr in tabmix options, item.id " + event.target.id + "\n has no prefstring");
      applyData["undefined"] = true;
      document.documentElement.getButton("extra1").disabled = false;
      return;
   }
}

//XXXX check if we need to use inverted on the value
function getValue(item) {
   if (item.localName == "checkbox")
      return $("pref_" + item.id).hasAttribute("inverted") ? !item.checked : item.checked;

   return item.value;
}

// set value to item
function setValue(item, newValue) {
   if (item.localName == "checkbox")
      item.checked = $("pref_" + item.id).hasAttribute("inverted") ? !newValue : newValue;
   else
      item.value = newValue;
}

//function updateApplyData(item, newValue) {
function updateApplyData(item) {
   var newValue = item.value;
   var savedValue = getPrefByType(item);
   var pref = item.getAttribute("prefstring");

   if (savedValue != newValue)
      applyData[pref] = newValue;
   else if (pref in applyData)
      delete applyData[pref];

   var applyCount = 0;
   for (var n in applyData) {
      if (++applyCount > 0)
         break;
   }

   var applyButton = document.documentElement.getButton("extra1");
   if (applyButton.disabled != (applyCount == 0))
      applyButton.disabled = applyCount == 0;
}

function TM_disableApply() {
 document.documentElement.getButton("extra1").disabled = true;
 applyData = [];
}

function setLastTab() {
   Tabmix.prefs.setIntPref("selected_tab", $("tabMixTabBox").selectedIndex);

   var subtabs = document.getElementsByAttribute("subtub", "true");
   var subTab = "selected_sub_tab";
   for (var i = 0; i < subtabs.length; i++)
      Tabmix.prefs.setIntPref(subtabs[i].getAttribute("value"), subtabs[i].selectedIndex);

   // remove EventListener when we exit
   window.removeEventListener("command", TM_enableApply, false);
   window.removeEventListener("input", TM_enableApply, false);
   window.removeEventListener("keypress", keyPressInText, false);
}

function getTab() {
   var selTabindex = Tabmix.getIntPref("selected_tab" , 0, true);
   TM_selectTab(selTabindex);

   var subtabs = document.getElementsByAttribute("subtub", true);
   var subTab = "extensions.tabmix.selected_sub_tab";
   for (var i = 0; i < subtabs.length; i++) {
      var val = Tabmix.getIntPref(subTab + subtabs[i].getAttribute("value"), 0);
      subtabs[i].selectedIndex = val;
   }
}

// this function is called from here and from Tabmix.openOptionsDialog if the dialog already opened
function TM_selectTab(aSelTab) {
  var tabbox = $("tabMixTabBox");
  tabbox.lastselectedIndex = tabbox.selectedIndex;
  tabbox.selectedIndex = (aSelTab) ? aSelTab : 0;
  var tabId = document.getElementsByTagName("tab")[aSelTab].id;
  var catButtons = $("TM_ButtonBox").childNodes;

  for(var i = 0; i < catButtons.length; i++)
    if(catButtons[i].getAttribute('group', 'categories'))
      catButtons[i].setAttribute('checked', (catButtons[i].id == 'button' + tabId));
}

function showIncompatible() {
   var topwin = Tabmix.getTopWin();
   if (topwin) {
      var result = topwin.disableExtensions(this);
      if (result) {
         $("incompatible").collapsed = true;
         sizeToContent();
      }
      this.focus();
   }
   else {
///XXX do we have locals entry for this ?
      Services.prompt.alert(window, "Tabmix Error", "You must have one browser window to use TabMix Options");
      window.close();
   }
}

//XXX TODO check if we can move this to appearance.js
// we call this also from browser window when BrowserCustomizeToolbar finish
// look at Tabmix.delayedStartup in setup.js
function toolbarButtons(aWindow) {
  // Display > Toolbar
  var buttons = ["btn_sessionmanager", "btn_undoclose", "btn_closedwindows", "btn_tabslist"];
  var onToolbar = $("onToolbar");
  var onPlate = $("onPlate");
  for (var i = 0; i < buttons.length; ++i ) {
    var button = aWindow.document.getElementById(buttons[i]);
    var optionButton = $("_" + buttons[i]).parentNode;
    if (button)
      onToolbar.appendChild(optionButton);
    else
      onPlate.appendChild(optionButton);
  }
  onToolbar.childNodes[1].hidden = onToolbar.childNodes.length > 2;
  onPlate.childNodes[1].hidden = onPlate.childNodes.length > 2;
  let newTabButton = aWindow.document.getElementById("new-tab-button");
  let enablePosition =  newTabButton && newTabButton.parentNode == aWindow.gBrowser.tabContainer._container;

  TM_Options.setItem("newTabButton", "disableObserver", !enablePosition || null);
  TM_Options.disabled("newTabButton", !enablePosition);
}

function openHelp(aPageaddress) {
  var helpTopic = aPageaddress || document.documentElement.currentPane.helpTopic;
  if (document.documentElement.currentPane.id == "paneSession" ) {
    if (helpTopic == "tabmix") {
      var box = document.documentElement.currentPane.getElementsByTagName("tabbox");
      helpTopic = box[1].selectedTab.getAttribute("helpTopic");
    }
    else
      helpTopic = "";
  }
  var helpPage = "http://tmp.garyr.net/help/#"
  var helpUrl = helpPage + helpTopic;
  var tabToSelect;
  // Check if the help page already open
  var recentWindow = Tabmix.getTopWin();
  var tabBrowser = recentWindow.gBrowser;
  for (var i = 0; i < tabBrowser.browsers.length; i++) {
    if (tabBrowser.browsers[i].currentURI.spec.indexOf(helpPage) == 0) {
      tabToSelect = tabBrowser.tabs[i];
      break;
    }
  }
  if (!tabToSelect) {
    if (tabBrowser.tabContainer.isBlankNotBusyTab(tabBrowser.mCurrentTab))
      tabToSelect = tabBrowser.mCurrentTab
    else
      tabToSelect = tabBrowser.addTab("about:blank");
  }
  tabToSelect.linkedBrowser.stop();
  tabBrowser.selectedTab = tabToSelect;
  tabBrowser.selectedBrowser.userTypedValue = helpUrl;
  // allow to load in current tab
  tabBrowser.selectedBrowser.tabmix_allowLoad = true;
  recentWindow.loadURI(helpUrl, null, null, false);
  tabBrowser.selectedBrowser.focus();
}

Tabmix.lazy_import(window, "Shortcuts", "Shortcuts", "Shortcuts");
