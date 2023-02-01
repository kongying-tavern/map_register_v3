import { ElMessage } from 'element-plus'
import type { NavigationGuardWithThis, Router } from 'vue-router'
import { isInPermissionList, isInWhiteList } from '../utils'
import { useUserStore } from '@/stores'
import { Logger } from '@/utils'

const logger = new Logger('[beforeEachGuard]')

/** 导航前置守卫，使用函数传递参数来生成一个回调，以便后期增加更多操作 */
export const beforeEachGuard = (
  router: Router,
): NavigationGuardWithThis<void> => {
  return (to, from, next) => {
    logger.info(`"${from.path}" => "${to.path}"`)

    const userStore = useUserStore()
    const tokenValid = userStore.validateUserToken()

    if (isInWhiteList(to)) {
      // 如果用户已登录，但手动导航到登录页，则重定向到地图页
      if (to.path === '/login' && tokenValid)
        return next('/map')
      return next(true)
    }

    const routes = router.getRoutes()
    logger.info(routes)
    const isRouteExist = routes.find(route => route.path === to.path)
    if (!isRouteExist) {
      ElMessage.error('目标路由不存在')
      return next(false)
    }

    if (!isInPermissionList(to)) {
      ElMessage.error('没有访问权限')
      return next(false)
    }

    if (!tokenValid) {
      ElMessage.error('用户凭证无效')
      return next('/login')
    }

    // 当本地存储的 id 不存在时（用于应对刷新）或与鉴权信息不一致时（用于应对直接输入登录地址的跳转）更新用户信息
    if (!userStore.info.id || userStore.info.id !== userStore.auth.userId)
      userStore.updateUserInfo()

    return next(true)
  }
}
