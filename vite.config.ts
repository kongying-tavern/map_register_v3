import { join, resolve } from 'path'
import type { ProxyOptions } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import { getMHYProxys } from './.vite'
import { openapi2ts } from './plugins'

export default defineConfig(({ mode }) => {
  const ENV = loadEnv(mode, '.') as ImportMetaEnv
  // eslint-disable-next-line no-console
  console.log('[ENV]', ENV)

  const proxy: Record<string, string | ProxyOptions> = {
    ...getMHYProxys(),
    [ENV.VITE_API_BASE]: {
      target: ENV.VITE_API_PROXY_TARGET,
      changeOrigin: true,
      rewrite: path => path.replace(new RegExp(`${ENV.VITE_API_BASE}`), ''),
    },
  }

  return {
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
          replacement: `${resolve(__dirname, 'src')}/`,
        },
      ],
    },

    plugins: [
      Vue(),
      VueJsx(),
      AutoImport({
        imports: ['vue', '@vueuse/core', 'vue-router'],
      }),
      openapi2ts([
        {
          schemaPath: `${ENV.VITE_API_PROXY_TARGET}/v3/api-docs`,
          requestImportStatement: 'import { request } from \'@/utils\'',
          serversPath: join('./src/api'),
          apiPrefix: '\'/api\'',
          projectName: 'api',
        },
      ]),
    ],
  }
})
