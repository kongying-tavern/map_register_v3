import type { RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores'

/** 判断是否有目标路由的权限 */
export const isInPermissionList = (to: RouteLocationNormalized) => {
  if (!to.meta?.roles)
    return true

  const userStore = useUserStore()
  if (!userStore.auth.userRoles)
    return false

  return to.meta.roles.includes(userStore.auth.userRoles[0] ?? '')
}
