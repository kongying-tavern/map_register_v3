import { join, resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import { getMHYProxys } from './.vite'
import { openapi2ts } from './plugins'

export default defineConfig(({ mode }) => {
  const ENV = loadEnv(mode, '.') as ImportMetaEnv
  console.log('[ENV]', ENV)

  return {
    server: {
      host: '0.0.0.0',
      port: 9000,
      proxy: {
        ...getMHYProxys(),
        [ENV.VITE_API_BASE]: {
          target: ENV.VITE_API_PROXY_TARGET,
          changeOrigin: true,
          rewrite: path =>
            path.replace(new RegExp(`${ENV.VITE_API_BASE}`), ''),
        },
      },
    },

    preview: {
      host: '0.0.0.0',
      port: 13101,
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
          schemaPath: 'http://ddns.minemc.top:13010/api/v3/api-docs',
          requestImportStatement: 'import { request } from \'@/utils\'',
          serversPath: join('./src/api'),
          apiPrefix: '\'/api\'',
          projectName: 'api',
        },
        {
          schemaPath: 'http://ddns.minemc.top:13010/system/v3/api-docs',
          requestImportStatement: 'import { request } from \'@/utils\'',
          serversPath: join('./src/api'),
          apiPrefix: '\'/system\'',
          projectName: 'system',
        },
      ]),
    ],
  }
})
