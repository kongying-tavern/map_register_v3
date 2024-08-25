import path from 'node:path'
import fs from 'node:fs/promises'
import type { Plugin, ProxyOptions } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import BaseSSL from '@vitejs/plugin-basic-ssl'
import { simpleGit } from 'simple-git'
import { openapi2ts } from './plugins'

export default defineConfig(async ({ mode }) => {
  const git = simpleGit()

  const ENV = loadEnv(mode, '.') as ImportMetaEnv
  // eslint-disable-next-line no-console
  console.log('[ENV]', ENV)

  if ([
    ENV.VITE_API_AUTH_USERNAME,
    ENV.VITE_API_AUTH_PASSWORD,
    ENV.VITE_IMG_SERVER_USERNAME,
    ENV.VITE_IMG_SERVER_PASSWORD,
  ].some(token => !token))
    throw new Error('所需的前置开发信息缺失，请查看Apifox或联系管理员获取')

  const proxy: Record<string, string | ProxyOptions> = {
    [ENV.VITE_API_BASE]: {
      target: ENV.VITE_API_PROXY_TARGET,
      changeOrigin: true,
      rewrite: path => path.replace(new RegExp(`${ENV.VITE_API_BASE}`), ''),
    },
    [ENV.VITE_ASSETS_BASE]: {
      target: ENV.VITE_ASSETS_PROXY_TARGET,
      changeOrigin: true,
      rewrite: path => path.replace(new RegExp(`${ENV.VITE_ASSETS_BASE}`), ''),
    },
  }

  const plugins: Plugin[] = [
    Vue({
      script: {
        defineModel: true,
      },
    }),
    VueJsx(),
    AutoImport({
      imports: ['vue', '@vueuse/core', 'vue-router'],
      dts: './types/auto-imports.d.ts',
    }),
    openapi2ts([
      {
        schemaPath: `${ENV.VITE_API_PROXY_TARGET}/v3/api-docs`,
        requestImportStatement: 'import { request } from \'@/utils\'',
        serversPath: path.join('./src/api'),
        apiPrefix: '',
        projectName: 'api',
      },
    ], ENV.VITE_DEVELOPMENT_MODE === 'offline'),
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
      __VUE_OPTIONS_API__: false,

      // 在生产环境中关闭 devtools 支持
      __VUE_PROD_DEVTOOLS__: false,

      // 禁用生产版本中水合不匹配的详细警告以优化
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,

      __APP_VERSION__: `'${VERSION}'`,
      __APP_BRANCH__: `'${COMMIT_BRANCH}'`,
      __APP_COMMIT_HASH__: `'${COMMIT_HASH}'`,
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
