import type { NavigationGuardWithThis, Router } from 'vue-router'
import { useUserAuthStore, useUserInfoStore } from '@/stores'
import type { Logger } from '@/utils'
import { RoleLevel } from '@/shared'

const isOfflineMode = import.meta.env.DEV && (import.meta.env.VITE_DEVELOPMENT_MODE === 'offline')

/**
 * 导航前置守卫，使用函数传递参数来生成一个回调，以便后期增加更多操作
 * @note 当前守卫代码的规模尚且不大，出于开发便捷性的考虑，判断逻辑尽量不要做抽离
 */
export const beforeEachGuard = (router: Router, logger: Logger): NavigationGuardWithThis<void> => {
  // TODO 当使用动态生成路由时此项优化可能失效
  const routesSet = new Set(router.getRoutes().map(route => route.path))

  return (to, from, next) => {
    const userAuthStore = useUserAuthStore()
    const userInfoStore = useUserInfoStore()

    logger.info(`"${from.path}"(${from.meta.title}) → "${to.path}"(${to.meta.title})`)

    if (!routesSet.has(to.path))
      return next('/404')

    // 离线开发模式下不进行路由前置守卫
    if (isOfflineMode)
      return next(true)

    const { role, redirectOnLogin } = to.meta ?? {}

    /** 是否登录 */
    const isLogin = Number(userAuthStore.isTokenValid)
    /** 路由是否有权限限制 */
    const isLimited = Number(role !== undefined)
    /** 角色权限等级是否满足 */
    const isAccess = Number(role !== undefined && userInfoStore.userRoleLevel >= RoleLevel[role])

    const permission = Number.parseInt(`${isLogin}${isLimited}${isAccess}`, 2)

    logger.info(`权限检查 P:${isLogin}${isLimited}${isAccess} R:${role}`)

    return ({
      0b000: () => {
        next(true)
      },
      0b001: () => {
        next(true)
      },
      0b010: () => {
        userAuthStore.clearAuth()
        next('/login')
      },
      0b011: () => {
        userAuthStore.clearAuth()
        next('/login')
      },
      0b100: () => {
        redirectOnLogin ? next(redirectOnLogin) : next(true)
      },
      0b101: () => {
        redirectOnLogin ? next(redirectOnLogin) : next(true)
      },
      0b110: () => {
        next(new Error('没有访问权限'))
      },
      0b111: () => {
        next(true)
      },
    } as Record<number, () => void>)[permission]()
  }
}
