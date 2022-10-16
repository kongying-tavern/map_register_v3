import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import './style/app.scss'
import { router } from '@/router'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router)
  .use(ElementPlus)
  .mount('#app')
