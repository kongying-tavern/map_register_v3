/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@antfu'],

  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
