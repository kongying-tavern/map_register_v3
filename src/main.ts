import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import './style/app.scss'
import { router } from '@/router'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .mount('#app')
