import { defineStore } from 'pinia'
import { RouterHook } from './utils'
import { useState } from '@/hooks'
import { useUserInfoStore } from '@/stores'
import { RoleLevel } from '@/shared'

export const useRouteStore = defineStore('route', () => {
  const userInfoStore = useUserInfoStore()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  /** 根据权限筛选出的一级菜单的路由 */
  const menuRoutes = computed(() => {
    const routes = router.getRoutes().find(item => item.path === '/')?.children ?? []
    return routes.filter((record) => {
      if (!record.meta?.role)
        return true
      return userInfoStore.userRoleLevel >= RoleLevel[record.meta.role]
    })
  })

  RouterHook.onAfterRouterEnter(useRouteStore, (store) => {
    store.setLoading(false)
  })

  return {
    // states
    loading,

    // getters
    menuRoutes,

    // actions
    setLoading,
  }
})
