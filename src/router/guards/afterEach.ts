import type { NavigationHookAfter } from 'vue-router'
import { useUserStore } from '@/stores'
import { Logger } from '@/utils'

/** 导航前置守卫，使用函数传递参数来生成一个回调，以便后期增加更多操作 */
export const afterEachGuard = (/** router: Router */): NavigationHookAfter => {
  return (to) => {
    Logger.groupEnd()
    nextTick(() => {
      useUserStore().isRouteLoading = false
      const title = useTitle()
      title.value = to.meta.title ?? import.meta.env.VITE_TITLE
    })
  }
}
