import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  jsonc: false,
  yaml: false,

  // 格式化工作由 prettier 专职进行
  stylistic: false,

  ignores: [
    '**/dist',
    '**/node_modules',
  ],

  // 在 eslint cli 指定的目录中过滤如下模式文件
  files: [
    '**/*.ts',
    '**/*.js',
    '**/*.vue',
    '**/*.jsx',
    '**/*.tsx',
  ],

  rules: {
    // 顶层函数允许使用箭头函数
    'antfu/top-level-function': 'off',
  },

  overrides: {
    javascript: {
      // 一般情况下不允许使用 console
      'no-console': 'warn',
    },

    typescript: {
      // 默认参数必须放在最后
      'default-param-last': 'error',

      // 一般情况下不允许使用 any
      'ts/no-explicit-any': 'warn',

      'ts/naming-convention': [
        'error',
        // TS interface 只允许大驼峰
        {
          selector: 'interface',
          format: ['PascalCase'],
          leadingUnderscore: 'forbid',
        },
        // TS Type 只允许大驼峰
        {
          selector: 'typeLike',
          format: ['PascalCase'],
          leadingUnderscore: 'forbid',
        },
        // 变量只允许大小驼峰、全大写下划线、全小写下划线
        {
          selector: 'variable',
          format: ['PascalCase', 'camelCase', 'UPPER_CASE', 'snake_case'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
      ],
    },

    vue: {
      // 组件名称至少由2个单词组成
      'vue/multi-word-component-names': 'error',

      // 组件定义名称只允许大驼峰
      'vue/component-definition-name-casing': ['error', 'PascalCase'],

      // 组件属性名称只允许小驼峰
      'vue/prop-name-casing': ['error', 'camelCase'],

      // 禁止在非函数作用域对 ref 解构以避免响应性丢失
      'vue/no-ref-object-reactivity-loss': 'error',
    },
  },
})
