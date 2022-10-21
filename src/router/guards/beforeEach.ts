import type { NavigationGuardWithThis, Router } from 'vue-router'
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

    const userStore = useUserStore()
    const tokenValid = userStore.validateUserToken()
    if (!tokenValid && to.path !== '/login') {
      debug && console.log('[beforeEachGuard]', '用户凭证过期，重定向到登录页')
      return next('/login')
    }

    // 当本地存储的 id 不存在时（用于应对刷新）或与鉴权信息不一致时（用于应对直接输入登录地址的跳转）更新用户信息
    if (!userStore.info.id || userStore.info.id !== userStore.auth.userId)
      userStore.updateUserInfo()

    return next()
  }
}
