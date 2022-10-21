import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElemenePlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import './style/app.scss'
import { router } from '@/router'
import 'element-plus/dist/index.css'

const app = createApp(App)

for (const [key, icon] of Object.entries(ElemenePlusIconsVue))
  app.component(key, icon)

app
  .use(createPinia())
  .use(router)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .mount('#app')
