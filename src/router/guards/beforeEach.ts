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
  return async (to, from, next) => {
    Logger.group('[vue-router-process]')
    logger.info(`"${from.path}" => "${to.path}"`)

    const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'

    const userStore = useUserStore()

    const go = () => {
      userStore.isRouteLoading = true
      next(true)
    }

    // 离线模式下不进行路由前置守卫
    if (isOfflineMode)
      return next(true)

    const isTokenValid = userStore.validateUserToken()

    if (isInWhiteList(to)) {
      // 如果用户已登录，但手动导航到部分页面，则重定向到地图页
      return isTokenValid ? next('/') : go()
    }

    if (!isTokenValid) {
      ElMessage.error('用户凭证无效')
      userStore.logout()
      return next(false)
    }

    const isRouteExist = router.getRoutes().find(route => route.path === to.path)
    if (!isRouteExist) {
      ElMessage.error('目标路由不存在')
      return next(false)
    }

    if (!isInPermissionList(to)) {
      ElMessage.error('没有访问权限')
      return next(false)
    }

    // 确保在进入路由时用户信息已更新
    (!userStore.info.id || userStore.info.id !== userStore.auth.userId) && await userStore.updateUserInfo()
    // 确保在进入路由时用户设置已更新
    !userStore.preference.filterStates && await userStore.updateUserPreference()
    go()

    await userStore.createRefreshTimer()
    to.meta.preload && await userStore.preloadMission()
  }
}
