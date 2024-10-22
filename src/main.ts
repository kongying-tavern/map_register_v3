import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import { ElementIcons, createLogger, createPWA, customPaint } from '@/plugin'
import './style/app.scss'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { useArchiveStore, useDadianStore, useUserStore } from '@/stores'
import { AppError } from '@/components'

const container = '#app'

try {
  const app = createApp(App)
  app
    .use(createPinia())
    .use(createLogger())
    .use(createPWA())
    .use(customPaint())
    .use(ElementPlus, {
      locale: zhCn,
    })
    .use(ElementIcons)
  await useDadianStore().init()
  await useUserStore().init()
  await useArchiveStore().init()
  app.mount('#app')
}
catch (err) {
  createApp(AppError, {
    message: err instanceof Error ? err.message : `${err}`,
  }).mount(container)
}
