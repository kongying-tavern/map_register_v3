import { defineStore } from 'pinia'
import { useUserAuthStore } from '.'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { NoticeChannel } from '@/shared'
import { useSocketStore } from '@/stores'

export const useNoticeStore = defineStore('global-notice', () => {
  const userAuthStore = useUserAuthStore()

  const { data: noticeList, refresh, ...rest } = useFetchHook({
    shallow: true,
    initialValue: [],
    onRequest: async () => {
      if (!userAuthStore.validateToken())
        return []
      const { data: { record = [] } = {} } = await Api.notice.listNotice({
        channels: [NoticeChannel.COMMON, NoticeChannel.DASHBOARD],
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

  const socketStore = useSocketStore()

  socketStore.event.on('NoticeAdded', refresh)
  socketStore.event.on('NoticeDeleted', refresh)
  socketStore.event.on('NoticeUpdated', refresh)

  return {
    noticeList,
    refresh,
    ...rest,
  }
})
