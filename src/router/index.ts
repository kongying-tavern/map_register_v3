import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import { ElMessage } from 'element-plus'
import type { RouterHistory, RouterScrollBehavior } from 'vue-router'
import routes from './routes'
import { beforeEachGuard } from './guards'
import { Logger, messageFrom } from '@/utils'
import { useRouteStore } from '@/stores'
import { routerHook } from '@/stores/hooks'

const logger = new Logger('[Router]')

const history: RouterHistory = ({
  history: createWebHistory,
  hash: createWebHashHistory,
  memory: createMemoryHistory,
}[import.meta.env.VITE_ROUTER_MODE] ?? createWebHashHistory)(import.meta.env.BASE_URL)

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

// ==================== 导航栈开始 ====================
router.beforeEach(async (...{ 1: from, 2: next }) => {
  if (['/', '/login', '/register'].includes(from.path))
    await routerHook.applyCallbacks('onBeforeRouterEnter')
  next(true)
})

router.beforeEach(beforeEachGuard(router, logger))

router.beforeEach((to) => {
  if (to.meta.loading)
    useRouteStore().setLoading(true)
})

router.afterEach((to) => {
  const routeStore = useRouteStore()
  routerHook.applyCallbacks('onAfterRouterEnter')
  nextTick(() => {
    useRouteStore().setLoading(false)
    const title = useTitle()
    title.value = to.meta.title ?? import.meta.env.VITE_TITLE
    routeStore.lastError = {
      path: '',
      count: 0,
    }
  })
})

// ==================== 导航栈结束 ====================
router.onError(async (err, to) => {
  const routeStore = useRouteStore()
  routeStore.setLoading(false)
  ElMessage.error({
    message: `导航至${to.meta.title}失败，原因为：${messageFrom(err)}`,
    offset: 48,
  })
})

export { router }
