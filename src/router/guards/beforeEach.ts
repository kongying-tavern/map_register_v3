import type { NavigationGuardWithThis, Router } from 'vue-router'
import { useAuthInfo, validateUserToken } from '@/utils'
import { useUserStore } from '@/stores'

interface BeforeEachGuardOptions {
  debug?: boolean
}

export const beforeEachGuard = (
  router: Router,
  options: BeforeEachGuardOptions = {},
): NavigationGuardWithThis<void> => {
  const { debug = false } = options

  return (to, from, next) => {
    debug && console.log('[beforeEachGuard]', `"${from.path}" => "${to.path}"`)

    // TODO: 抽离
    // 白名单直接跳转
    if (to.path === '/login')
      return next()

    const routes = router.getRoutes()
    debug && console.log('[beforeEachGuard]', routes)
    const isRouteExist = routes.find(route => route.path === to.path)
    if (!isRouteExist) {
      debug && console.log('[beforeEachGuard] 目标路由不存在，重定向到登录页')
      return next('/login')
    }

    const tokenValid = validateUserToken()
    if (!tokenValid && to.path !== '/login') {
      debug && console.log('[beforeEachGuard]', '用户凭证过期，重定向到登录页')
      return next('/login')
    }

    // 当本地存储的 id 不存在时更新用户信息（用于应对刷新）
    const userAuth = useAuthInfo()
    const userStore = useUserStore()
    if (!userStore.info.id)
      userStore.updateUserInfo(userAuth.value.userId)

    return next()
  }
}
