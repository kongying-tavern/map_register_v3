import { defineStore } from 'pinia'
import { routerHook } from './hooks'
import { useState } from '@/hooks'
import { useUserInfoStore } from '@/stores'
import { RoleLevel } from '@/shared'

/**
 * 用于共享路由状态、路由插件注入
 */
export const useRouteStore = defineStore('global-route', () => {
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

  routerHook.onAfterRouterEnter(useRouteStore, (store) => {
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
