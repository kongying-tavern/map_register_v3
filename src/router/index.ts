import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import type { RouterHistory, RouterScrollBehavior } from 'vue-router'
import { ElMessage } from 'element-plus'
import routes from './routes'
import { afterEachGuard, beforeEachGuard } from './guards'
import { messageFrom } from '@/utils'

const history: RouterHistory = (
  {
    history: createWebHistory,
    hash: createWebHashHistory,
    memory: createMemoryHistory,
  }[import.meta.env.VITE_ROUTER_MODE] ?? createWebHashHistory
)(import.meta.env.BASE_URL)

const scrollBehavior: RouterScrollBehavior = () => ({
  top: 0,
  left: 0,
  behavior: 'smooth',
})

const router = createRouter({
  routes,
  history,
  scrollBehavior,
})

router.beforeEach(beforeEachGuard(router))

router.afterEach(afterEachGuard())

router.onError((err) => {
  ElMessage.error({
    message: `无法导航到目标路由，原因为：${messageFrom(err)}`,
    offset: 48,
  })
})

export { router }
