import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import { ElementIcons, createLogger, createPWA, customPaint } from '@/plugin'
import './style/app.scss'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { useDadianStore } from '@/stores'

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

const dadianStore = useDadianStore()

await dadianStore.init()

app.mount('#app')
