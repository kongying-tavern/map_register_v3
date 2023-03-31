import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElemenePlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import './style/app.scss'
import { router } from '@/router'
import { createPWA } from '@/plugin'
import { registerPaint } from '@/style/CSSHoudini'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)

for (const [key, icon] of Object.entries(ElemenePlusIconsVue))
  app.component(key, icon)

app
  .use(createPinia())
  .use(router)
  .use(createPWA())
  .use(ElementPlus, {
    locale: zhCn,
  })
  .use(registerPaint())
  .mount('#app')
