import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import './style/app.scss'
import { router } from '@/router'
import { ElementIcons, createPWA, customPaint } from '@/plugin'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

app
  .use(createPinia())
  .use(createPWA())
  .use(customPaint())
  .use(router)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .use(ElementIcons)
  .mount('#app')
