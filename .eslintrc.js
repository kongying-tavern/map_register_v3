/** @type {import('eslint').Linter.Config} */
module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  /** 代码使用 vue 解析器 */
  parser: 'vue-eslint-parser',

  parserOptions: {
    ecmaVersion: '2021',
    sourceType: 'module',
    /** <script> 内代码使用 ts 解析器 */
    parser: '@typescript-eslint/parser',
  },

  env: {
    node: true,
    browser: true,
    es2021: true,
    commonjs: true,
    'vue/setup-compiler-macros': true,
  },

  // 注意: 顺序会影响解析结果!
  extends: [
    /** eslint 基本规则 */
    'eslint:recommended',
    /** typescript 基本规则 */
    'plugin:@typescript-eslint/recommended',
    /** vue3 基本规则 */
    'plugin:vue/vue3-recommended',
    /** 解除 eslint 与 prettier 的冲突配置 */
    'plugin:prettier/recommended',
    /** 让 eslint 使用 prettier 进行格式化 */
    'prettier',
  ],

  plugins: ['vue', 'prettier'],

  // globals: {
  //   ga: "readonly", // Google Analytics
  //   cordova: "readonly",
  //   __statics: "readonly",
  //   __QUASAR_SSR__: "readonly",
  //   __QUASAR_SSR_SERVER__: "readonly",
  //   __QUASAR_SSR_CLIENT__: "readonly",
  //   __QUASAR_SSR_PWA__: "readonly",
  //   process: "readonly",
  //   Capacitor: "readonly",
  //   chrome: "readonly",
  // },

  // add your custom rules here
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    //   "prefer-promise-reject-errors": "off",
    //   // allow debugger during development only
    //   "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    //   // eslint basic
    //   camelcase: [
    //     "warn",
    //     {
    //       properties: "never",
    //     },
    //   ],
    //   quotes: ["warn", "single"],
    //   "no-trailing-spaces": "warn",
    //   "comma-spacing": "warn",
    //   "eol-last": ["warn", "always"],
    //   indent: ["warn", 2],
    //   "template-curly-spacing": ["warn", "never"],
    //   "no-multi-spaces": [
    //     "warn",
    //     {
    //       ignoreEOLComments: true,
    //     },
    //   ],
    //   "space-before-blocks": ["warn", "always"],
    //   "space-before-function-paren": [
    //     "warn",
    //     {
    //       anonymous: "never",
    //       named: "never",
    //       asyncArrow: "always",
    //     },
    //   ],
    //   "spaced-comment": ["warn", "always"],
    //   // eslint rules related to vue
    //   "array-bracket-newline": ["warn", "consistent"],
    //   "array-bracket-spacing": [
    //     "warn",
    //     "never",
    //     {
    //       singleValue: false,
    //       objectsInArrays: false,
    //       arraysInArrays: false,
    //     },
    //   ],
    //   "arrow-spacing": [
    //     "warn",
    //     {
    //       before: true,
    //       after: true,
    //     },
    //   ],
    //   "block-spacing": ["warn", "always"],
    //   "comma-dangle": ["warn", "never"],
    //   "comma-style": "warn",
    //   "dot-location": ["warn", "property"],
    //   "key-spacing": [
    //     "warn",
    //     {
    //       beforeColon: false,
    //       afterColon: true,
    //       mode: "strict",
    //     },
    //   ],
    //   "object-curly-newline": [
    //     "warn",
    //     {
    //       minProperties: 1,
    //       consistent: true,
    //     },
    //   ],
    //   "object-curly-spacing": ["warn", "never"],
    //   "object-property-newline": [
    //     "warn",
    //     {
    //       allowAllPropertiesOnSameLine: false,
    //     },
    //   ],
    //   "dot-notation": "warn",
    //   "quote-props": ["warn", "as-needed"],
    //   "space-in-parens": ["warn", "never"],
    //   "space-infix-ops": "warn",
    //   "space-unary-ops": [
    //     "warn",
    //     {
    //       words: true,
    //       nonwords: false,
    //     },
    //   ],
    //   "no-useless-concat": "error",
    //   // vue rules similar to eslint
    //   "vue/array-bracket-newline": ["warn", "consistent"],
    //   "vue/array-bracket-spacing": [
    //     "warn",
    //     "never",
    //     {
    //       singleValue: false,
    //       objectsInArrays: false,
    //       arraysInArrays: false,
    //     },
    //   ],
    //   "vue/arrow-spacing": [
    //     "warn",
    //     {
    //       before: true,
    //       after: true,
    //     },
    //   ],
    //   "vue/block-spacing": ["warn", "always"],
    //   "vue/comma-dangle": ["warn", "never"],
    //   "vue/comma-style": "warn",
    //   "vue/dot-location": ["warn", "property"],
    //   "vue/key-spacing": [
    //     "warn",
    //     {
    //       beforeColon: false,
    //       afterColon: true,
    //       mode: "strict",
    //     },
    //   ],
    //   "vue/object-curly-newline": [
    //     "warn",
    //     {
    //       minProperties: 1,
    //       consistent: true,
    //     },
    //   ],
    //   "vue/object-curly-spacing": ["warn", "never"],
    //   "vue/object-property-newline": [
    //     "warn",
    //     {
    //       allowAllPropertiesOnSameLine: false,
    //     },
    //   ],
    //   "vue/dot-notation": "warn",
    //   "vue/quote-props": ["warn", "as-needed"],
    //   "vue/space-in-parens": ["warn", "never"],
    //   "vue/space-infix-ops": "warn",
    //   "vue/space-unary-ops": [
    //     "warn",
    //     {
    //       words: true,
    //       nonwords: false,
    //     },
    //   ],
    //   "vue/no-useless-concat": "error",
    //   // vue rules
    //   "vue/max-attributes-per-line": [
    //     "warn",
    //     {
    //       singleline: {
    //         max: 3,
    //       },
    //       multiline: {
    //         max: 1,
    //       },
    //     },
    //   ],
    //   "vue/html-self-closing": "error",
    //   "vue/html-indent": ["warn", 2],
    //   "vue/singleline-html-element-content-newline": "warn",
    //   "vue/html-closing-bracket-newline": "warn",
    //   "vue/mustache-interpolation-spacing": ["warn", "always"],
    //   "vue/attributes-order": "warn",
    //   "vue/component-tags-order": [
    //     "error",
    //     {
    //       order: ["template", "script", "style"],
    //     },
    //   ],
    //   "vue/no-lone-template": "error",
    //   "vue/order-in-components": "error",
    //   "vue/this-in-template": "error",
  },
}
