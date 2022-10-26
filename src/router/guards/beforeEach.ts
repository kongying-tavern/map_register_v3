import { ElMessage } from 'element-plus'
import type { NavigationGuardWithThis, Router } from 'vue-router'
import { isInPermissionList, isInWhiteList } from '../utils'
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

    if (isInWhiteList(to))
      return next(true)

    const routes = router.getRoutes()
    debug && console.log('[beforeEachGuard]', routes)
    const isRouteExist = routes.find(route => route.path === to.path)
    if (!isRouteExist) {
      ElMessage.error('目标路由不存在')
      return next(false)
    }

    if (!isInPermissionList(to)) {
      ElMessage.error('没有访问权限')
      return next(false)
    }

    const userStore = useUserStore()
    const tokenValid = userStore.validateUserToken()
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
