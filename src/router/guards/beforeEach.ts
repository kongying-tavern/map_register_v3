import type { NavigationGuardWithThis, Router } from 'vue-router'
import { isInPermissionList, isInWhiteList } from '../utils'
import { useUserStore } from '@/stores'
import * as stores from '@/stores'
import { Logger } from '@/utils'

const logger = new Logger('[beforeEachGuard]')

/** 导航前置守卫，使用函数传递参数来生成一个回调，以便后期增加更多操作 */
export const beforeEachGuard = (router: Router): NavigationGuardWithThis<void> => {
  return async (to, from, next) => {
    Logger.group('[vue-router-process]')
    logger.info(`"${from.path}" => "${to.path}"`)

    const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'

    const userStore = useUserStore()
    userStore.isRouteLoading = true

    // 离线模式下不进行路由前置守卫
    if (isOfflineMode)
      return next(true)

    if (['/', '/login'].includes(from.path)) {
      await Promise.allSettled(Object.values(stores).reduce((seed, useStore) => {
        if (typeof useStore !== 'function')
          return seed
        const store = useStore()
        if ('init' in store && typeof store.init === 'function')
          seed.push(store.init())
        return seed
      }, [] as unknown[]))
    }

    const isTokenValid = userStore.validateUserToken()
    if (isInWhiteList(to)) {
      // 如果用户已登录，但手动导航到部分页面，则重定向到地图页
      return isTokenValid ? next('/') : next(true)
    }

    const isRouteExist = router.getRoutes().find(route => route.path === to.path)
    if (!isRouteExist)
      return next(new Error('目标路由不存在'))

    if (!isTokenValid) {
      userStore.logout()
      return next(new Error('用户凭证无效'))
    }

    if (!isInPermissionList(to))
      return next(new Error('没有访问权限'))

    // 确保在进入路由时用户信息已更新
    ;(!userStore.info.id || userStore.info.id !== userStore.auth.userId) && await userStore.updateUserInfo()
    // 确保在进入路由时用户设置已更新
    !userStore.preference.id && await userStore.updateUserPreference()
    next(true)

    userStore.createRefreshTimer()
    to.meta.preload && userStore.preloadMission()
  }
}
