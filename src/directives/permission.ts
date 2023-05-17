import type { Directive } from 'vue'
import { useUserStore } from '@/stores'

/** 此指令用于限制组件仅在具有管理员权限时显示 */
export const vAdmin: Directive<HTMLElement, void> = {
  beforeMount: (el) => {
    const userStore = useUserStore()
    if (userStore.isAdmin)
      return
    el.style.display = 'none'
  },
}

/** 此指令用于限制组件仅在具有打点权限时显示 */
export const vMarkeable: Directive<HTMLElement, void> = {
  beforeMount: (el) => {
    const userStore = useUserStore()
    if (userStore.hasPunctauteRights)
      return
    el.style.display = 'none'
  },
}
