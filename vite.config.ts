import type { Plugin, ProxyOptions } from 'vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import BaseSSL from '@vitejs/plugin-basic-ssl'
import Vue from '@vitejs/plugin-vue'
import { simpleGit } from 'simple-git'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(async ({ mode }) => {
  const git = simpleGit()

  const ENV = loadEnv(mode, '.') as ImportMetaEnv

  console.log('[ENV]', ENV)

  const proxy: Record<string, string | ProxyOptions> = {
    [ENV.VITE_API_BASE]: {
      target: ENV.VITE_API_PROXY_TARGET,
      changeOrigin: true,
      rewrite: path => path.replace(new RegExp(`${ENV.VITE_API_BASE}`), ''),
    },
  }

  const plugins: Plugin[] = [
    Vue({
      script: {
        defineModel: true,
      },
      template: {
        compilerOptions: {
          comments: false,
        },
      },
    }),
    AutoImport({
      imports: ['vue', '@vueuse/core', 'vue-router'],
      dts: 'types/auto-imports.d.ts',
    }),
    VitePWA({
      devOptions: {
        enabled: true,
        type: 'module',
        resolveTempFolder: () => 'temp/dev-dist',
      },
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: undefined,
      },
      srcDir: 'src/worker/service',
      filename: 'service.worker.ts',
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
    }),
  ]

  if (ENV.VITE_HTTPS) {
    plugins.push(BaseSSL({
      name: 'test',
    }))
  }

  const COMMIT_BRANCH = await git.revparse(['--abbrev-ref', 'HEAD'])
  const COMMIT_HASH = await git.revparse(['--short', 'HEAD'])

  const packageJSON = await fs.readFile('package.json', { encoding: 'utf8' })
  const VERSION = JSON.parse(packageJSON).version as string

  return {
    define: {
      // 关闭选项式 API 支持
      '__VUE_OPTIONS_API__': false,

      // 在生产环境中关闭 devtools 支持
      '__VUE_PROD_DEVTOOLS__': false,

      // 禁用生产版本中水合不匹配的详细警告以优化
      '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': false,

      'import.meta.env.APP_VERSION': JSON.stringify(VERSION),
      'import.meta.env.APP_BRANCH': JSON.stringify(COMMIT_BRANCH),
      'import.meta.env.APP_COMMIT_HASH': JSON.stringify(COMMIT_HASH),
    },

    server: {
      host: '0.0.0.0',
      port: 9000,
      cors: true,
      proxy,
    },

    preview: {
      host: '0.0.0.0',
      port: 13101,
      cors: true,
      proxy,
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue': ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus'],
            'element-plus-icons': ['@element-plus/icons-vue'],
            'deck': ['deck.gl'],
            'dexie': ['dexie'],
            'rxjs': ['rxjs'],
            'antv-pattern': ['@antv/g-pattern'],
            'antv-g2': ['@antv/g2'],
            'antv-g6': ['@antv/g6'],
            'antv-s2': ['@antv/s2'],
            'tiptap': ['@tiptap/core', '@tiptap/extension-text-align', '@tiptap/starter-kit', '@tiptap/vue-3'],
            'vueuse': ['@vueuse/core', '@vueuse/rxjs'],
          },
        },
      },
    },

    resolve: {
      alias: [
        {
          find: /^@\//,
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
    },

    plugins,
  }
})
