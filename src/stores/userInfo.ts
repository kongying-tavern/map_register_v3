import { defineStore } from 'pinia'
import System from '@/api/system'

const localUserInfo = useLocalStorage<API.SysUserVo>('__ys_user_info', {})

export const useUserStore = defineStore('user-info', {
  state: () => ({
    info: localUserInfo.value,
  }),
  actions: {
    async updateUserInfo(userId?: number) {
      if (!userId)
        return
      try {
        const { data = {} } = await System.sysUserController.getUserInfo({ userId })
        this.info = data
        localUserInfo.value = data
      }
      catch (err) {
        // TODO: no action
      }
    },
  },
})
