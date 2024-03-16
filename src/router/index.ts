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
router.beforeEach(async (_to, from, next) => {
  ['/', '/login', '/register'].includes(from.path) && await routerHook.applyCallbacks('onBeforeRouterEnter')
  next(true)
})

router.beforeEach(beforeEachGuard(router))

router.beforeEach((to) => {
  if (to.meta.loading)
    useRouteStore().setLoading(true)
})

const logger = new Logger('[路由后置守卫]')

router.afterEach((to) => {
  logger.info('导航结束')
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

  // 对上次错误地址重试访问一次
  if (routeStore.lastError.path !== to.path || routeStore.lastError.count < 1) {
    await nextTick()
    logger.info('尝试重访', to.path)
    routeStore.lastError = {
      path: to.path,
      count: 1,
    }
    router.replace(to)
    return
  }

  // 依然还是上次错误，重定向回登录页
  router.replace('/login')

  ElMessage.error({
    message: `导航至${to.meta.title}失败，原因为：${messageFrom(err)}`,
    offset: 48,
  })
})

export { router }
