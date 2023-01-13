import type { RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores'

/** 判断是否有目标路由的权限 */
export const isInPermissionList = (to: RouteLocationNormalized) => {
  if (!to.meta?.roles)
    return true

  const userStore = useUserStore()
  if (!userStore.info.roleList)
    return false

  return to.meta.roles.includes(userStore.info.roleList[0]?.code ?? '')
}
