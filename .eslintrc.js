/* eslint strict: 0, object-curly-spacing: 0 */
/* global module */
module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "es6": true,
    "node": false,
    "amd": false,
    "mocha": false,
    "jasmine": false
  },

  // for eslint 2.0.0
  "parserOptions": {
    "ecmaVersion": 6
  },

  "rules": {
    "no-alert": 2,
    "no-array-constructor": 2,
    "no-bitwise": 0,
    "no-caller": 2,
    "no-case-declarations": 2,
    "no-catch-shadow": 2,
    "no-class-assign": 2,
    "no-cond-assign": 2,
    "no-confusing-arrow": 0,
    "no-console": 0,
    "no-const-assign": 2,
    "no-constant-condition": 2,
    "no-continue": 0,
    "no-control-regex": 2,
    "no-debugger": 2,
    "no-delete-var": 2,
    "no-div-regex": 0,
    "no-dupe-class-members": 0,
    "no-dupe-keys": 2,
    "no-dupe-args": 2,
    "no-duplicate-case": 2,
    "no-duplicate-imports": 0,
    "no-else-return": 2,
    // this show error on catch empty block unless there is a comment
    "no-empty": 0,
    "no-empty-character-class": 0,
    "no-empty-function": 0,
    "no-empty-pattern": 0,
    "no-eq-null": 2,
    "no-eval": 0,
    "no-ex-assign": 2,
    "no-extend-native": 2,
    "no-extra-bind": 2,
    "no-extra-boolean-cast": 2,
    "no-extra-label": 0,
    "no-extra-parens": 0, // TODO need to fix this...
    "no-extra-semi": 2,
    "no-fallthrough": 2,
    "no-floating-decimal": 0,
    "no-func-assign": 2,
    "no-implicit-coercion": 0,
    "no-implicit-globals": 0,
    "no-implied-eval": 2,
    "no-inline-comments": 0,
    "no-inner-declarations": [2, "functions"],
    "no-invalid-regexp": 2,
    "no-invalid-this": 0,
    "no-irregular-whitespace": 2,
    "no-iterator": 2,
    "no-label-var": 2,
    "no-labels": 2,
    "no-lone-blocks": 2,
    "no-lonely-if": 2,
    "no-loop-func": 2,
    // "no-mixed-requires": [0, false], // node
    "no-mixed-spaces-and-tabs": [2, false],
    "no-multi-spaces": 2,
    // TODO need to fix this...
    "no-multi-str": 0,
    "no-multiple-empty-lines": [2, {"max": 1}],
    "no-native-reassign": 2,
    "no-negated-condition": 0,
    "no-negated-in-lhs": 2,
    "no-nested-ternary": 0,
    "no-new": 2,
    "no-new-func": 2,
    "no-new-object": 2,
    // "no-new-require": 0, // node
    "no-new-symbol": 0,
    "no-new-wrappers": 2,
    "no-obj-calls": 2,
    "no-octal": 2,
    "no-octal-escape": 2,
    "no-param-reassign": 0,
    // "no-path-concat": 0, // node
    "no-plusplus": 0,
    // "no-process-env": 0, // node
    // "no-process-exit": 2, // node
    "no-proto": 2,
    "no-redeclare": 2,
    "no-regex-spaces": 2,
    "no-restricted-globals": 0,
    "no-restricted-imports": 0,
    // "no-restricted-modules": 0, // node
    "no-restricted-syntax": 0,
    "no-return-assign": [2, "except-parens"],
    "no-script-url": 0,
    "no-self-assign": 0,
    "no-self-compare": 2,
    "no-sequences": 2,
    "no-shadow": [2, {"hoist": "all"}],
    "no-shadow-restricted-names": 2,
    "no-whitespace-before-property": 0,
    "no-spaced-func": 2,
    "no-sparse-arrays": 2,
    // "no-sync": 0, // node
    "no-ternary": 0,
    // the editore remove trailing-spaces on save
    "no-trailing-spaces": 0,
    "no-this-before-super": 2,
    "no-throw-literal": 2,
    "no-undef": 2,
    "no-undef-init": 2,
    "no-undefined": 0,
    "no-unexpected-multiline": 0,
    "no-underscore-dangle": 0,
    "no-unmodified-loop-condition": 0,
    "no-unneeded-ternary": 2,
    "no-unreachable": 2,
    "no-unused-expressions": 2,
    "no-unused-labels": 0,
    "no-unused-vars": [2, {"vars": "all", "args": "after-used"}],
    "no-use-before-define": [2, "nofunc"],
    "no-useless-call": 0,
    "no-useless-concat": 0,
    "no-useless-constructor": 0,
    "no-useless-escape": 0,
    "no-void": 0,
    "no-var": 0,
    "no-warning-comments": [0, { "terms": ["todo", "fixme", "xxx"], "location": "start" }],
    "no-with": 2,
    "no-magic-numbers": 0,
    "array-bracket-spacing": [2, "never"],
    "array-callback-return": 0,
    "arrow-body-style": 0,
    "arrow-parens": 0,
    "arrow-spacing": [2, {"before": true, "after": true}],
    "accessor-pairs": 0,
    "block-scoped-var": 2,
    "block-spacing": 0,
    "brace-style": [2, "1tbs"],
    // "callback-return": 0, // node
    "camelcase": 0,
    // TODO - maybe in the future
    // "comma-dangle": [2, "always-multiline"],
    "comma-dangle": 0,
    "comma-spacing": 2,
    "comma-style": [2, "last"],
    "complexity": [0, 11],
    "consistent-return": 2,
    "computed-property-spacing": 0,
    "consistent-this": [2, "self"],
    "constructor-super": 2,
    // TODO - currently there are more the 1500 errors if we set "curly": 2
    "curly": [0, "all"],
    "default-case": 0,
    "dot-location": 0,
    "dot-notation": [2, { "allowKeywords": true }],
    "eol-last": 2,
    "eqeqeq": 0,
    "func-names": 0,
    "func-style": [0, "declaration"],
    "generator-star-spacing": [2, "after"],
    // "global-require": 0, // node
    "guard-for-in": 0,
    // "handle-callback-err": 0, // node
    "id-length": 0,
    "indent": [2, 2, {"SwitchCase": 1, "VariableDeclarator": {"var": 2, "let": 2, "const": 3}}],
    "init-declarations": 0,
    "jsx-quotes": 0,
    "key-spacing": [2, { "beforeColon": false, "afterColon": true }],
    "keyword-spacing": 2,
    "lines-around-comment": [0, {"beforeBlockComment": true, "allowBlockStart": true, "allowBlockEnd": true}],
    // XX error in Brackets - Eslint complain that first line is LF
    "linebreak-style": [0, "windows"],
    "max-depth": [0, 4],
    "max-len": [0, 120, 4],
    "max-nested-callbacks": [0, 2],
    "max-params": [0, 3],
    "max-statements": [0, 10],
    "max-statements-per-line": 0,
    "new-cap": 0,
    "new-parens": 2,
    "newline-after-var": 0,
    "newline-before-return": 0,
    "newline-per-chained-call": 0,
    "object-curly-spacing": [2, "never"],
    "object-shorthand": 0,
    "one-var": 0,
    "one-var-declaration-per-line": 0,
    "operator-assignment": [0, "always"],
    "operator-linebreak": [2, "after"],
    "padded-blocks": [0, "never"],
    "prefer-arrow-callback": 0,
    "prefer-const": 0,  // TODO many error in old code
    "prefer-reflect": 0, // NOT YET
    "prefer-rest-params": 0,
    "prefer-spread": 0, // since Firefox 34
    "prefer-template": 0,
    // in Firefox i can use properties obj - {default: x, private: y}
    "quote-props": [0, "as-needed", {"keywords": true}],
    "quotes": [0, "double"],
    "radix": 0,
    "id-match": 0,
    "id-blacklist": 0,
    "require-jsdoc": 0,
    "require-yield": 2,
    "semi": 2,
    "semi-spacing": [2, {"before": false, "after": true}],
    "sort-vars": 0,
    "sort-imports": 0,
    "space-before-blocks": [2, "always"],
    "space-before-function-paren": [2, "never"],
    "space-in-parens": [2, "never"],
    "space-infix-ops": 2,
    "space-unary-ops": [2, { "words": true, "nonwords": false }],
    "spaced-comment": [2, "always", {
      "exceptions": ["-", "+", "/"],
      "markers": ["/", "/XXX", "XXX", "****", "***", "**"]
    }],
    "strict": [2, "global"],
    "template-curly-spacing": 0,
    "use-isnan": 2,
    "valid-jsdoc": 0,
    "valid-typeof": 2,
    "vars-on-top": 0,
    "wrap-iife": 2,
    "wrap-regex": 0,
    "yield-star-spacing": [2, "after"],
    "yoda": [2, "never"]
  },

  "globals": {
    // tabmix globals
    // when extends will work in Brackets move each global to
    // specific file in its folder
    "$": true,
    "self": true,
    "AsyncUtils": false,
    "Assert": false,
    "AutoReload": false,
    "exports": false,
    "KeyEvent": false,
    "Decode": false,
    "filenamesRegex": false,
    "MergeWindows": false,
    "getFormattedKey": false,
    "getKeysForShortcut": false,
    "gTMPprefObserver": true,
    "gAppearancePane": false,
    "gPrefWindow": false,
    "PromptSvc": false,
    "gMenuPane": false,
    "isMac": false,
    "LinkNodeUtils": false,
    "Prefs": false,
    "reportError": false,
    "RDFSvc": false,
    "Shortcuts": false,
    "SessionBackups": false,
    "SSS": false,
    "syncPrefsList": false,
    "tablib": false,
    "Tabmix": true,
    "TabmixAboutNewTab": false,
    "TabmixAllTabs": false,
    "TabmixContext": false,
    "TabmixContentClick": false,
    "TabmixConvertSession": false,
    "TabmixProgressListener": true,
    "TabmixPlacesUtils": false,
    "TabmixSessionData": true,
    "TabmixSessionManager": true,
    "TabmixSvc": false,
    "TabmixTabbar": false,
    "TabmixTabClickOptions": false,
    "TabmixUtils": false,
    "TMP_BrowserOpenTab": false,
    "TMP_ClosedTabs": false,
    "TMP_eventListener": true,
    "TMP_extensionsCompatibility": false,
    "TMP_LastTab": false,
    "TMP_Places": false,
    "TMP_SessionStore": false,
    "TMP_tabDNDObserver": false,
    "TMP_TabView": false,

    // firefox globals
    "aboutNewTabService": false,
    "addMessageListener": false,
    "AddonManager": false,
    "BROWSER_NEW_TAB_URL": false,
    "BrowserOnClick": false,
    "BrowserCloseTabOrWindow": false,
    "browserDragAndDrop": false,
    "BrowserOpenTab": false,
    "BrowserTryToCloseWindow": false,
    "BrowserUtils": false,
    "Cc": true,
    "centerWindowOnScreen": false,
    "ChromeWindow": false,
    "Ci": true,
    "closeMenus": false,
    "Components": false,
    "content": false,
    "ContentClick": false,
    "ContextMenu": false,
    "Cr": true,
    "ctrlTab": false,
    "Cu": true,
    "CustomizableUI": false,
    "customizeToolbarDone": false,
    "closeWindow": false,
    "dialog": false,
    "DirectoryLinksProvider": false,
    "docShell": false,
    "DocShellCapabilities": false,
    "dump": false,
    "focusAndSelectUrlBar": false,
    "FullScreen": false,
    "gAllPages": false,
    "gBrowser": false,
    "gBrowserInit": false,
    "gContextMenu": false,
    "getBoolPref": false,
    "getBrowserURL": false,
    "gGrid": false,
    "gHomeButton": false,
    "gInPrintPreviewMode": false,
    "gMultiProcessBrowser": false,
    "gNavigatorBundle": false,
    "gNavToolbox": false,
    "goDoCommand": false,
    "gRemoteTabsUI": false,
    "gSanitizePromptDialog": false,
    "gURLBar": false,
    "handleDroppedLink": false,
    "HistoryMenu": false,
    "isBlankPageURL": false,
    "isTabEmpty": false,
    "loadURI": false,
    "makeURI": false,
    "moveToAlertPosition": false,
    "NetUtil": false,
    "nsBrowserAccess": false,
    "nsContextMenu": false,
    "NewTabURL": false,
    "newWindowButtonObserver": false,
    "openDialog": false,
    "openLinkIn": false,
    "openUILink": false,
    "openUILinkIn": false,
    "openURI": false,
    "OS": false,
    "PanelUI": false,
    "PageThumbs": false,
    "PlacesCommandHook": false,
    "PlacesOrganizer": false,
    "PlacesUIUtils": false,
    "PlacesUtils": false,
    "PlacesViewBase": false,
    "PluralForm": false,
    "pref": false,
    "PrivateBrowsingUtils": false,
    "RestoreLastSessionObserver": false,
    "Sanitizer": false,
    "Scratchpad": false,
    "sendAsyncMessage": false,
    "sendSyncMessage": false,
    "sendRpcMessage": false,
    "Services": false,
    "SidebarUtils": false,
    "SessionStore": false,
    "TabContextMenu": false,
    "TabGroupsMigrator": false,
    "TAB_DROP_TYPE": false,
    "TabsInTitlebar": false,
    "TabsOnTop": false,
    "TabState": false,
    "TabStateCache": false,
    "TabView": false,
    "Task": false,
    "URLBarSetURI": false,
    "urlSecurityCheck": false,
    "undoCloseWindow": false,
    "whereToOpenLink": false,
    "XPCOMUtils": false,
    "XULCommandEvent": false,
    "XULElement": false,
    "XULBrowserWindow": false,

    // other
    "cookiepieContextMenu": false,
    "classiccompactoptions": false,
    "colorfulTabs": false,
    "esteban_torres": false,
    "Fd": false,
    "FdTabLoader": false,
    "IeView": false,
    "ieview": false,
    "IeTab": false,
    "middleMousePaste": false,
    "privateTab": false,
    "SessionSaver": false,
    "SwitchThemesModule": false,
    "SubmitToTab": false,

    // extensions folder globals
    "bgSaverPref": false,
    "CHROMATABS": false,
    "contentAreaDNDObserver": false,
    "com": false,
    "closeallOverlay": false,
    "faviconize": false,
    "FireGestures": false,
    "FdUtils": false,
    "foxTab": false,
    "gFxWeaveGlue": false,
    "IeTab2": false,
    "Local_Install": false,
    "mgBuiltInFunctions": false,
    "MouseControl": false,
    "objLinkify": false,
    "Omnibar": false,
    "PersonaController": false,
    "rdrb": false,
    "readPref": false,
    "RSSTICKER": false,
    "SecondSearchBrowser": false,
    "SpeedDial": false,
    "tileTabs": false,
    "TreeStyleTabBrowser": false,
    "TreeStyleTabWindowHelper": false
  }
};
