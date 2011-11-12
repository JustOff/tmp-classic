pref("extensions.tabmix.disableIncompatible", true);
pref("extensions.tabmix.linkTarget", false);

pref("extensions.tabmix.opentabforLinks", 0); // 2010-09-16 we replaced speLink 
pref("extensions.tabmix.lockallTabs", false); // added 2010-09-16
pref("extensions.tabmix.lockAppTabs", false); // added 2010-09-16
pref("extensions.tabmix.singleWindow", false);

pref("extensions.tabmix.opentabfor.bookmarks", false);
// pref("extensions.tabmix.opentabfor.search", false); - replace with Firefox pref
pref("extensions.tabmix.opentabfor.history", false);
pref("extensions.tabmix.opentabfor.urlbar", false);
pref("extensions.tabmix.middlecurrent", false);
pref("extensions.tabmix.inversefocusLinks", false);
pref("extensions.tabmix.inversefocusOther", false);

pref("extensions.tabmix.loadNewInBackground", false);
pref("extensions.tabmix.loadUrlInBackground", false);
pref("extensions.tabmix.loadSearchInBackground", false);
pref("extensions.tabmix.loadDuplicateInBackground", false);
pref("extensions.tabmix.loadBookmarksGroupInBackground", false);
pref("browser.tabs.loadFolderAndReplace", true); // remove from firefox 3.7 2009-10-17

pref("extensions.tabmix.loadOnNewTab", 0);
pref("extensions.tabmix.newTabUrl", "");
pref("extensions.tabmix.replaceLastTabWith", 0);
pref("extensions.tabmix.newTabUrl_afterLastTab", "");

pref("extensions.tabmix.openNewTabNext", false);
pref("extensions.tabmix.openTabNext", false);
pref("extensions.tabmix.openTabNextInverse", true);
pref("extensions.tabmix.openDuplicateNext", true);
pref("extensions.tabmix.focusTab", 2);
pref("extensions.tabmix.protectedtabs.warnOnClose", true);
/*
2009-10-10
    swap prefs --> warn when closing window "extensions.tabmix.windows.warnOnClose" replaced with "browser.tabs.warnOnClose"
                   warn when closing tabs "browser.tabs.warnOnClose" replaced with "extensions.tabmix.tabs.warnOnClose"
*/
pref("extensions.tabmix.tabs.warnOnClose", true);
/*
2008-09-23
we replace extensions.tabmix.keepWindow
with firefox pref
pref("browser.tabs.closeWindowWithLastTab", true);
this pref added to firefox 3.1 on 2008-09-22
*/
// pref("extensions.tabmix.keepWindow", false);
pref("extensions.tabmix.keepLastTab", false);

pref("extensions.tabmix.tabBarMode", 1);
pref("extensions.tabmix.tabBarMaxRow", 3);
pref("extensions.tabmix.tabBarSpace", false);
pref("extensions.tabmix.hideTabBarButton", true);
pref("extensions.tabmix.hideAllTabsButton", false);
pref("extensions.tabmix.newTabButton", true);
/*
2009-01-31
repalced with extensions.tabmix.newTabButton.position
0 - Left side
1 - Right side
2 - After last tab (default) - for version befor Fx 3.1 2 - Right side
pref("extensions.tabmix.newTabButton.leftside", false);
*/
pref("extensions.tabmix.newTabButton.position", 2);
/*
2010-06-08
change default to Never Hide tabbar
pref("extensions.tabmix.hideTabbar", 1); // default to browser.tabs.autoHide == true
*/
pref("extensions.tabmix.hideTabbar", 0); // default to browser.tabs.autoHide == false
pref("extensions.tabmix.tabBarPosition", 0);

pref("extensions.tabmix.progressMeter", true);
pref("extensions.tabmix.noprogress", false);
/*
2010-03-07
replaced with .locked and .protected
pref("extensions.tabmix.extraIcons", true);
*/
pref("extensions.tabmix.extraIcons.locked", true);
pref("extensions.tabmix.extraIcons.protected", true);
pref("extensions.tabmix.extraIcons.autoreload", true);
pref("extensions.tabmix.unreadTab", true);
pref("extensions.tabmix.unreadTabreload", true);
pref("extensions.tabmix.currentTab", false);

pref("extensions.tabmix.otherTab", false);
pref("extensions.tabmix.styles.currentTab", '{"italic":false,"bold":false,"underline":false,"text":true,"textColor":"rgba(0,0,0,1)","bg":false,"bgColor":"rgba(236,233,216,1)"}');
pref("extensions.tabmix.styles.unreadTab",  '{"italic":true,"bold":false,"underline":false,"text":true,"textColor":"rgba(204,0,0,1)","bg":false,"bgColor":"rgba(236,233,216,1)"}');
pref("extensions.tabmix.styles.otherTab",   '{"italic":false,"bold":false,"underline":false,"text":true,"textColor":"rgba(0,0,0,1)","bg":false,"bgColor":"rgba(236,233,216,1)"}');
pref("extensions.tabmix.styles.progressMeter", '{"bg":true,"bgColor":"rgba(170,170,255,1)"}');

/* 2008-12-24 change all style prefs into one
pref("extensions.tabmix.boldUnread", false);
pref("extensions.tabmix.italicUnread", true);
pref("extensions.tabmix.underlineUnread", false);
pref("extensions.tabmix.boldCurrent", false);
pref("extensions.tabmix.italicCurrent", false);
pref("extensions.tabmix.underlineCurrent", false);
pref("extensions.tabmix.unreadColorCode", "#CC0000");
pref("extensions.tabmix.currentColorCode", "#000000");
pref("extensions.tabmix.progressColorCode", "#AAAAFF");
pref("extensions.tabmix.useCurrentColor", false);
pref("extensions.tabmix.useUnreadColor", true);
pref("extensions.tabmix.useProgressColor", true);
*/

/*
2008-11-29
replaced with browser.tabs.tabMaxWidth
*/
//pref("extensions.tabmix.minWidth", 100);
/*
2008-11-29
replaced with browser.tabs.tabMaxWidth
*/
// pref("extensions.tabmix.maxWidth", 250);
pref("extensions.tabmix.flexTabs", false);

pref("extensions.tabmix.titlefrombookmark", false);

pref("extensions.tabmix.tabs.closeButtons.enable", true);
pref("extensions.tabmix.tabs.closeButtons", 1);
pref("extensions.tabmix.tabs.closeButtons.onLeft", false);
pref("extensions.tabmix.tabs.closeButtons.delay", 50);

pref("extensions.tabmix.useFirefoxDragmark", true);
pref("extensions.tabmix.enableScrollSwitch", false);
pref("extensions.tabmix.reversedScroll", false);

pref("extensions.tabmix.dblClickTab", 0);
pref("extensions.tabmix.dblClickTabbar", 1);
pref("extensions.tabmix.middleClickTab", 2);
pref("extensions.tabmix.middleClickTabbar", 10);
pref("extensions.tabmix.ctrlClickTab", 22);
pref("extensions.tabmix.ctrlClickTabbar", 0);
pref("extensions.tabmix.shiftClickTab", 5);
pref("extensions.tabmix.shiftClickTabbar", 0);
pref("extensions.tabmix.altClickTab", 6);
pref("extensions.tabmix.altClickTabbar", 0);

pref("extensions.tabmix.dblClickTabbar_changesize", true);

/*
 2011-01-26
 change mouseDownSelect to selectTabOnMouseDown
pref("extensions.tabmix.mouseDownSelect", false);
*/
pref("extensions.tabmix.selectTabOnMouseDown", true);
pref("extensions.tabmix.mouseOverSelect", false);
pref("extensions.tabmix.mouseOverSelectDelay", 250);
pref("extensions.tabmix.tabFlip", false);
pref("extensions.tabmix.tabFlipDelay", 250);
/*
 2008-09-23
we replace extensions.tabmix.lasttab.handleCtrlTab
with firefox pref
pref("browser.ctrlTab.previews", true);
 */
//pref("extensions.tabmix.lasttab.handleCtrlTab", true);
pref("extensions.tabmix.lasttab.tabPreviews", true); // Firefox 3.1+
pref("extensions.tabmix.lasttab.favorLeftToRightOrdering", true);
pref("extensions.tabmix.lasttab.respondToMouseInTabList", true);
pref("extensions.tabmix.lasttab.showTabList", false);

pref("extensions.tabmix.slideDelay", 10);

pref("extensions.tabmix.undoClose", true);
/*
 * we use browser.sessionstore.max_tabs_undo from 2008-02-26
 */
//pref("extensions.tabmix.undoCloseCache", 5);
pref("extensions.tabmix.undoClosePosition", true);
pref("extensions.tabmix.undoCloseButton.menuonly", false);

pref("extensions.tabmix.moveToGroup", true); // from 2010-08-13 , for Firefox 4.0+ only
pref("extensions.tabmix.newTabMenu", true);
pref("extensions.tabmix.duplicateMenu", true); // 2008-04-12: changed from false to true
pref("extensions.tabmix.duplicateinWinMenu", false);
pref("extensions.tabmix.detachTabMenu", false);
pref("extensions.tabmix.pinTabMenu", true);
pref("extensions.tabmix.renameTabMenu", false);
pref("extensions.tabmix.reloadTabMenu", true);
pref("extensions.tabmix.reloadAllMenu", true);
pref("extensions.tabmix.reloadRightMenu", false);
pref("extensions.tabmix.reloadLeftMenu", false);
pref("extensions.tabmix.reloadOtherMenu", false);
pref("extensions.tabmix.closeTabMenu", true);
pref("extensions.tabmix.closeTabContent", false);
pref("extensions.tabmix.closeAllMenu", false);
pref("extensions.tabmix.closeOtherMenu", true);
pref("extensions.tabmix.closeRightMenu", false);
pref("extensions.tabmix.closeLeftMenu", false);
pref("extensions.tabmix.undoCloseTabMenu", true);
pref("extensions.tabmix.undoCloseListMenu", true);
pref("extensions.tabmix.undoCloseTabContent", true);
pref("extensions.tabmix.undoCloseListContent", false);
pref("extensions.tabmix.lockTabMenu", true);
pref("extensions.tabmix.protectTabMenu", true);
pref("extensions.tabmix.lockTabContent", false);
pref("extensions.tabmix.protectTabContent", false);
pref("extensions.tabmix.docShellMenu", false);
pref("extensions.tabmix.freezeTabContent", false);
pref("extensions.tabmix.freezeTabMenu", false);
pref("extensions.tabmix.tabsList", false);
pref("extensions.tabmix.duplicateWinContent", false);
pref("extensions.tabmix.duplicateTabContent", false);
pref("extensions.tabmix.detachTabContent", false);
pref("extensions.tabmix.openAllLinks", true);
pref("extensions.tabmix.bookmarkTabsMenu", true);
pref("extensions.tabmix.bookmarkTabMenu", true);
pref("extensions.tabmix.linkWithHistory", false);
pref("extensions.tabmix.closeSimilarTabs", false);
pref("extensions.tabmix.showMergeWindow", false);
pref("extensions.tabmix.openLinkHere", false);
pref("extensions.tabmix.openInverseLink", true);
pref("extensions.tabmix.copyTabUrlMenu", true);

pref("extensions.tabmix.warnOnclose", true);
pref("extensions.tabmix.closeOnSelect", true);
pref("extensions.tabmix.mergeAllWindows", true);
pref("extensions.tabmix.placePopupNextToOpener", true);
pref("extensions.tabmix.mergePopups", false);
pref("extensions.tabmix.mergeWindowContent", false);
pref("extensions.tabmix.middleclickDelete", true);

pref("extensions.tabmix.optionsToolMenu", true);

pref("extensions.tabmix.enablefiletype", true);
pref("extensions.tabmix.filetype", "xpi zip rar exe tar jar gzip gz ace bin doc docx xls xlsx mdb ppt iso 7z cab arj lzh uue torrent /&disp=attd&/ php\?attachmentid=.* php\?act=Attach&type=post&id=.* /download.(php|asp)\?*/");

pref("extensions.{dc572301-7619-498c-a57d-39143191b318}.description", "chrome://tabmixplus/locale/tabmix.properties");

pref("extensions.tabmix.hideIcons", false);
pref("extensions.tabmix.disableF9Key", true); // 2009-08-28: default changed to true
pref("extensions.tabmix.disableF8Key", true);
pref("extensions.tabmix.reloadEvery.onReloadButton", false);

// session manager pref
pref("extensions.tabmix.sessionToolsMenu",true);
pref("extensions.tabmix.closedWinToolsMenu",false);

pref("extensions.tabmix.sessions.crashRecovery", true);
pref("extensions.tabmix.sessions.manager", true);
pref("extensions.tabmix.sessions.restore.concatenate", false);
pref("extensions.tabmix.sessions.restore.overwritetabs", true);
pref("extensions.tabmix.sessions.restore.overwritewindows", true);
pref("extensions.tabmix.sessions.restore.reloadall", false);
pref("extensions.tabmix.sessions.restore.saveoverwrite", true);
pref("extensions.tabmix.sessions.save.closedtabs", false);
pref("extensions.tabmix.sessions.save.history", true);
pref("extensions.tabmix.sessions.save.permissions", true);
pref("extensions.tabmix.sessions.save.selectedtab", true);
pref("extensions.tabmix.sessions.save.scrollposition", true);
pref("extensions.tabmix.sessions.save.locked", true);
pref("extensions.tabmix.sessions.save.protected", true);
pref("extensions.tabmix.sessions.menu.showext", true);
pref("extensions.tabmix.sessions.onClose", 0);
pref("extensions.tabmix.sessions.onStart", 2);
pref("extensions.tabmix.sessions.onStart.askifempty", true);
pref("extensions.tabmix.sessions.onStart.loadsession", -1);
pref("extensions.tabmix.sessions.onStart.sessionpath", "");
pref("extensions.tabmix.sessions.version", "");

pref("extensions.tabmix.autoReloadContent", true);
pref("extensions.tabmix.autoReloadMenu", false);
pref("extensions.tabmix.custom_reload_time", 90);
pref("extensions.tabmix.reload_time", 15);
// The maximum number of daily sessions backups to
// keep in <profile>/sessionbackups. Special values:
// -1: unlimited
//  0: no backups created (and deletes all existing backups)
pref("extensions.tabmix.sessions.max_backups", 7);
/*
  A positive integer that determines how many milliseconds to wait before scrolling the tab strip
  when extensions.tabmix.tabBarMode is 2 (in multi-bar mode) we scroll by row
  when we are in single window mode we scroll by tab
*/
pref("extensions.tabmix.clickToScroll.scrollDelay", 150);

// removed from Firefox 4.0+
pref("browser.tabs.tabMinWidth", 100);
pref("browser.tabs.tabMaxWidth", 250);
