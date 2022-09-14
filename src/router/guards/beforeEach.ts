import type { NavigationGuardWithThis, Router } from 'vue-router'

interface BeforeEachGuardOptions {
  debug?: boolean
}

export const beforeEachGuard = (
  router: Router,
  options: BeforeEachGuardOptions = {},
): NavigationGuardWithThis<void> => {
  const { debug } = options

  return (to, from, next) => {
    debug && console.log('[beforeEachGuard]', `"${from.path}" => "${to.path}"`)

    const routes = router.getRoutes()
    debug && console.log('[beforeEachGuard]', routes)
    const isRouteExist = routes.find((route) => route.path === to.path)

    if (!isRouteExist) {
      debug && console.log('[beforeEachGuard] 目标路由不存在，重定向到登录页')
      return next('/login')
    }

    next()
  }
}
