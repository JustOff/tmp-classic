/* eslint strict: 0, object-curly-spacing: 0 */
/* global module */
module.exports = {
  "root": true,
  "plugins": ["tabmix"],
  "env": {
    "es6": true,
    "tabmix/browser": true,
  },

  // for eslint 2.0.0
  "parserOptions": {
    "ecmaVersion": 6
  },

  "rules": {
    "tabmix/balanced-listeners": 2,
    "tabmix/import-globals": 2,
    "tabmix/no-single-arg-cu-import": 2,
    "no-alert": 2,
    "no-array-constructor": 2,
    "no-bitwise": 0,
    "no-caller": 2,
    "no-case-declarations": 2,
    "no-catch-shadow": 2,
    "no-class-assign": 2,
    "no-cond-assign": 2,
    "no-confusing-arrow": [2, {"allowParens": true}],
    "no-console": 0,
    "no-const-assign": 2,
    "no-constant-condition": 2,
    "no-continue": 2,
    "no-control-regex": 2,
    "no-debugger": 2,
    "no-delete-var": 2,
    "no-div-regex": 2,
    "no-dupe-args": 2,
    "no-dupe-class-members": 2,
    "no-dupe-keys": 2,
    "no-duplicate-case": 2,
    "no-duplicate-imports": [2, {"includeExports": true}],
    "no-else-return": 2,
    "no-empty": [2, {"allowEmptyCatch": true}],
    "no-empty-character-class": 2,
    "no-empty-function": 0,
    "no-empty-pattern": 2,
    "no-eq-null": 2,
    "no-eval": 0,
    "no-ex-assign": 2,
    "no-extend-native": 2,
    "no-extra-bind": 2,
    "no-extra-boolean-cast": 2,
    "no-extra-label": 2,
    "no-extra-parens": [2, "functions"], // TODO need to fix this for [2, "all"]
    "no-extra-semi": 2,
    "no-fallthrough": 2,
    "no-floating-decimal": 2,
    "no-func-assign": 2,
    "no-global-assign": 2,
    "no-implicit-coercion": 2,
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
    "no-magic-numbers": 0,
    "no-mixed-operators": 0,
    "no-mixed-requires": [0, false], // node
    "no-mixed-spaces-and-tabs": [2, false],
    "no-multi-spaces": 2,
    // TODO need to fix this...
    "no-multi-str": 0,
    "no-multiple-empty-lines": [2, {"max": 1}],
    "no-negated-condition": 0,
    "no-nested-ternary": 0,
    "no-new": 2,
    "no-new-func": 2,
    "no-new-object": 2,
    "no-new-require": 0, // node
    "no-new-symbol": 2,
    "no-new-wrappers": 2,
    "no-obj-calls": 2,
    "no-octal": 2,
    "no-octal-escape": 2,
    "no-param-reassign": 0,
    "no-path-concat": 0, // node
    "no-plusplus": 0,
    "no-process-env": 0, // node
    "no-process-exit": 2, // node
    "no-proto": 2,
    "no-prototype-builtins": 0,
    "no-redeclare": 2,
    "no-regex-spaces": 2,
    "no-restricted-globals": 0,
    "no-restricted-imports": 0,
    "no-restricted-modules": 0, // node
    "no-restricted-properties": 0,
    "no-restricted-syntax": 0,
    "no-return-assign": [2, "except-parens"],
    "no-script-url": 0,
    "no-self-assign": 2,
    "no-self-compare": 2,
    "no-sequences": 2,
    "no-shadow": [2, {"hoist": "all"}],
    "no-shadow-restricted-names": 2,
    "no-sparse-arrays": 2,
    "no-sync": 0, // node
    "no-tabs": 0,
    "no-template-curly-in-string": 2,
    "no-ternary": 0,
    "no-this-before-super": 2,
    "no-throw-literal": 2,
    "no-trailing-spaces": 2,
    "no-undef": 2,
    "no-undef-init": 2,
    "no-undefined": 0,
    "no-underscore-dangle": 0,
    "no-unexpected-multiline": 2,
    "no-unmodified-loop-condition": 2,
    "no-unneeded-ternary": 2,
    "no-unreachable": 2,
    "no-unsafe-finally": 2,
    "no-unsafe-negation": 2,
    "no-unused-expressions": 2,
    "no-unused-labels": 2,
    "no-unused-vars": [2, {"vars": "all", "args": "after-used"}],
    "no-use-before-define": [2, "nofunc"],
    "no-useless-call": 2,
    "no-useless-computed-key": 2,
    "no-useless-concat": 2,
    "no-useless-constructor": 2,
    "no-useless-escape": 2,
    "no-useless-rename": 2,
    "no-useless-return": 2,
    "no-var": 0,
    "no-void": 0,
    "no-warning-comments": [0, { "terms": ["todo", "fixme", "xxx"], "location": "start" }],
    "no-whitespace-before-property": 2,
    "no-with": 2,
    "accessor-pairs": 2,
    "array-bracket-spacing": [2, "never"],
    "array-callback-return": 2,
    "arrow-body-style": 0,
    "arrow-parens": [2, "as-needed"],
    "arrow-spacing": [2, {"before": true, "after": true}],
    "block-scoped-var": 2,
    "block-spacing": [2, "never"],
    "brace-style": [2, "1tbs", {"allowSingleLine": true}],
    "callback-return": 0,
    "camelcase": 0,
    "class-methods-use-this": 2,
    // TODO - maybe in the future
    // "comma-dangle": [2, "always-multiline"],
    "comma-dangle": 0,
    "comma-spacing": 2,
    "comma-style": [2, "last"],
    "complexity": [0, 11],
    "computed-property-spacing": [2, "never"],
    "consistent-return": 2,
    "consistent-this": [2, "self"],
    "constructor-super": 2,
    // TODO - currently there are more the 1500 errors if we set "curly": 2
    "curly": [0, "all"],
    "default-case": 0,
    "dot-location": [2, "property"],
    "dot-notation": [2, { "allowKeywords": true }],
    "eol-last": 2,
    "eqeqeq": 0,
    "func-call-spacing": [2, "never"],
    "func-name-matching": 0,
    "func-names": 0,
    "func-style": [0, "declaration"],
    "generator-star-spacing": [2, "after"],
    "global-require": 0, // node
    "guard-for-in": 2,
    "handle-callback-err": 0, // node
    "id-blacklist": 0,
    "id-length": 0,
    "id-match": 0,
    "indent": [2, 2, {
      "CallExpression": {"arguments": 1},
      "FunctionDeclaration": {"body": 1, "parameters": "first"},
      "FunctionExpression": {"body": 1, "parameters": "first"},
      "SwitchCase": 1,
      "VariableDeclarator": {"var": 2, "let": 2, "const": 3}
    }],
    "init-declarations": 0,
    "jsx-quotes": 0,
    "key-spacing": [2, { "beforeColon": false, "afterColon": true }],
    "keyword-spacing": 2,
    "line-comment-position": 0,
    "linebreak-style": [2, "windows"],
    "lines-around-comment": [0, {"beforeBlockComment": true, "allowBlockStart": true, "allowBlockEnd": true}],
    "lines-around-directive": [2, {"before": "never", "after": "always"}],
    "max-depth": [0, 4],
    "max-len": [0, 120, 4],
    "max-lines": 0,
    "max-nested-callbacks": [0, 2],
    "max-params": [0, 3],
    "max-statements": [0, 10],
    "max-statements-per-line": [2, {"max": 1}],
    "multiline-ternary": 0,
    "new-cap": 0,
    "new-parens": 2,
    "newline-after-var": 0,
    "newline-before-return": 0,
    "newline-per-chained-call": 0,
    "object-curly-newline": [2, {
      "ObjectExpression": {"multiline": true},
      "ObjectPattern": "never"
    }],
    "object-curly-spacing": [2, "never"],
    "object-property-newline": [2, {"allowMultiplePropertiesPerLine": true}],
    "object-shorthand": 0, // since Firefox 33
    "one-var": 0,
    "one-var-declaration-per-line": 0,
    "operator-assignment": [2, "always"],
    "operator-linebreak": [2, "after"],
    "padded-blocks": [2, "never"],
    "prefer-arrow-callback": [2, {"allowNamedFunctions": true}],
    "prefer-const": 0,  // TODO many errors in old code
    "prefer-numeric-literals": 0,
    "prefer-rest-params": 0, // I don’t want to be notified about arguments variables,
    "prefer-spread": 0, // Spread operator for function calls (Firefox 27)
    "prefer-template": 0, // since Firefox 34
    // in Firefox i can use properties obj - {default: x, private: y}
    "quote-props": [0, "as-needed", {"keywords": true}],
    "quotes": [0, "double"],
    "radix": 0,
    "require-jsdoc": 0,
    "require-yield": 2,
    "rest-spread-spacing": 2,
    "semi": 2,
    "semi-spacing": [2, {"before": false, "after": true}],
    "sort-imports": 0,
    "sort-keys": 0,
    "sort-vars": 0,
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
    "symbol-description": 2,
    "template-curly-spacing": [2, "never"],
    "unicode-bom": 0,
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
  }
};
