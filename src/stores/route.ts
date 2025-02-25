import { useState } from '@/hooks'
import { ROLE_MASK_MAP } from '@/shared'
import { useUserInfoStore } from '@/stores'
import { defineStore } from 'pinia'
import { routerHook } from './hooks'

/**
 * 用于共享路由状态、路由插件注入
 */
export const useRouteStore = defineStore('global-route', () => {
  const userInfoStore = useUserInfoStore()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const error = shallowRef('')

  /** 根据权限筛选出的一级菜单的路由 */
  const menuRoutes = computed(() => {
    const routes = router.getRoutes().find(item => item.path === '/')?.children ?? []
    return routes.filter((record) => {
      if (!record.meta?.role)
        return true
      return userInfoStore.userRoleLevel >= ROLE_MASK_MAP[record.meta.role]
    })
  })

  routerHook.onAfterRouterEnter(useRouteStore, (store) => {
    store.setLoading(false)
  })

  return {
    // states
    loading,
    error,

    // getters
    menuRoutes,

    // actions
    setLoading,
  }
})
