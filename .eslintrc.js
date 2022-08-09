module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  parserOptions: {
    ecmaVersion: '2021' // Allows for the parsing of modern ECMAScript features
  },

  env: {
    node: true,
    browser: true,
    'vue/setup-compiler-macros': true
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',

    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    'plugin:vue/vue3-essential', // Priority A: Essential (Error Prevention)
    'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
    'plugin:vue/vue3-recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)

    // https://github.com/prettier/eslint-config-prettier#installation
    // usage with Prettier, provided by 'eslint-config-prettier'.
    'prettier'
  ],

  plugins: [
    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-files
    // required to lint *.vue files
    'vue'

    // https://github.com/typescript-eslint/typescript-eslint/issues/389#issuecomment-509292674
    // Prettier has not been included as plugin to avoid performance impact
    // add it as an extension for your IDE
  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  },

  // add your custom rules here
  rules: {
    'prefer-promise-reject-errors': 'off',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // eslint basic
    camelcase: 'error',
    quotes: [ 'error', 'single' ],
    'no-trailing-spaces': 'error',
    'comma-spacing': 'warn',
    'eol-last': [ 'error', 'always' ],
    indent: [ 'error', 2 ],
    'template-curly-spacing': [ 'warn', 'never' ],
    'no-multi-spaces': [ 'error', {
      ignoreEOLComments: true
    }],
    'space-before-blocks': [ 'error', 'always' ],
    'space-before-function-paren': [ 'error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }],
    'spaced-comment': [ 'error', 'always' ],

    // eslint rules related to vue
    'array-bracket-newline': [ 'warn', 'consistent' ],
    'array-bracket-spacing': [ 'warn', 'always', {
      singleValue: false,
      objectsInArrays: false,
      arraysInArrays: false
    }],
    'arrow-spacing': [ 'warn', {
      before: true,
      after: true
    }],
    'block-spacing': [ 'warn', 'always' ],
    'comma-dangle': [ 'warn', 'never' ],
    'comma-style': 'warn',
    'dot-location': [ 'warn', 'property' ],
    'key-spacing': [ 'warn', {
      beforeColon: false,
      afterColon: true,
      mode: 'strict'
    }],
    'object-curly-newline': [ 'warn', 'always' ],
    'object-curly-spacing': [ 'warn', 'always' ],
    'object-property-newline': [ 'warn', {
      allowAllPropertiesOnSameLine: true
    }],
    'dot-notation': 'warn',
    'quote-props': [ 'warn', 'as-needed' ],
    'space-in-parens': [ 'warn', 'never' ],
    'space-infix-ops': 'warn',
    'space-unary-ops': [ 'warn', {
      words: true,
      nonwords: false
    }],

    // vue rules similar to eslint
    'vue/array-bracket-newline': [ 'warn', 'consistent' ],
    'vue/array-bracket-spacing': [ 'warn', 'always', {
      singleValue: false,
      objectsInArrays: false,
      arraysInArrays: false
    }],
    'vue/arrow-spacing': [ 'warn', {
      before: true,
      after: true
    }],
    'vue/block-spacing': [ 'warn', 'always' ],
    'vue/comma-dangle': [ 'warn', 'never' ],
    'vue/comma-style': 'warn',
    'vue/dot-location': [ 'warn', 'property' ],
    'vue/key-spacing': [ 'warn', {
      beforeColon: false,
      afterColon: true,
      mode: 'strict'
    }],
    'vue/object-curly-newline': [ 'warn', 'always' ],
    'vue/object-curly-spacing': [ 'warn', 'always' ],
    'vue/object-property-newline': [ 'warn', {
      allowAllPropertiesOnSameLine: true
    }],
    'vue/dot-notation': 'warn',
    'vue/quote-props': [ 'warn', 'as-needed' ],
    'vue/space-in-parens': [ 'warn', 'never' ],
    'vue/space-infix-ops': 'warn',
    'vue/space-unary-ops': [ 'warn', {
      words: true,
      nonwords: false
    }],

    // vue rules
    'vue/max-attributes-per-line': [ 'error', {
      singleline: {
        max: 3
      },
      multiline: {
        max: 1
      }
    }],
    'vue/html-self-closing': 'error',
    'vue/html-indent': [ 'error', 2 ],
    'vue/singleline-html-element-content-newline': 'error',
    'vue/html-closing-bracket-newline': 'error',
    'vue/mustache-interpolation-spacing': [ 'error', 'always' ]
  }
};
