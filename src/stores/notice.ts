import { defineStore } from 'pinia'
import { useUserAuthStore } from '.'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ChannelEnum } from '@/shared'

export const useNoticeStore = defineStore('global-notice', () => {
  const userAuthStore = useUserAuthStore()

  const { data: noticeList, ...rest } = useFetchHook({
    shallow: true,
    initialValue: [],
    onRequest: async () => {
      if (!userAuthStore.validateToken())
        return []
      const { data: { record = [] } = {} } = await Api.notice.listNotice({
        channels: [ChannelEnum.COMMON, ChannelEnum.DASHBOARD],
        sort: ['validTimeStart-'],
        getValid: true,
        size: 100,
      })
      return record
    },
    diff: (oldData, newData) => {
      return JSON.stringify(oldData) === JSON.stringify(newData)
    },
  })

  return {
    noticeList,
    ...rest,
  }
})
