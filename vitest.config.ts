import type { Plugin } from 'vite'
import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vitest/config'

/**
 * Vitest 独立配置
 *
 * 不直接复用 `vite.config.ts`：
 * 应用配置中包含 PWA 插件、Git 信息注入、开发服务器代理等与测试无关的逻辑，
 * 混入测试会导致启动缓慢且引入不必要的副作用。
 *
 * 测试代码统一放置在根目录 `tests/` 中，与 `src/` 源码目录分离。
 */
export default defineConfig({
  plugins: [
    // 提供 .vue 单文件组件的编译能力
    Vue({
      script: {
        defineModel: true,
      },
      template: {
        compilerOptions: {
          comments: false,
        },
      },
    }) as Plugin,

    // 与应用保持一致，使源码中依赖自动导入的 API（ref / computed 等）在测试中同样可用
    AutoImport({
      imports: ['vue', '@vueuse/core', 'vue-router'],
      dts: 'types/auto-imports.d.ts',
    }),
  ],

  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${path.resolve(import.meta.dirname, 'src')}/`,
      },
    ],
  },

  test: {
    // 测试用例独立目录，按被测模块镜像 src 结构
    include: ['tests/**/*.{test,spec}.{ts,tsx,js,jsx,vue}'],
    // 全局初始化文件（补齐 jsdom 缺失的浏览器 API）
    setupFiles: ['./tests/setup.ts'],
    // 组件测试依赖 DOM 环境
    environment: 'jsdom',
    // 每个测试文件使用独立环境，避免模块级状态互相污染
    isolate: true,
    // 每个用例前自动还原 spy，避免用例之间互相影响
    restoreMocks: true,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/api/protobuf/**',
        'src/**/*.d.ts',
        'types/**',
      ],
    },
  },
})
