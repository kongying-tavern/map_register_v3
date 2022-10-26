import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import type { RouterHistory, RouterScrollBehavior } from 'vue-router'
import { ElMessage } from 'element-plus'
import routes from './routes'
import { beforeEachGuard } from './guards'
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

router.beforeEach(
  beforeEachGuard(router, {
    debug: import.meta.env.DEV,
  }),
)

router.onError((err) => {
  ElMessage.error(messageFrom(err))
})

export { router }
