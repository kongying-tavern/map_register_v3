import { validate_user_token } from '@/utils'
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
    const tokenValid = validate_user_token()

    if (!isRouteExist) {
      debug && console.log('[beforeEachGuard] 目标路由不存在，重定向到登录页')
      return next('/login')
    }
    if (!tokenValid && to.path !== '/login') return next('/login')
    // if (tokenValid && to.path === '/login') return next('/')
    else if (tokenValid) return next()
    else return next('/login')
  }
}
