import type { ShallowRef } from 'vue'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ChannelEnum } from '@/shared'
import { useUserAuthStore } from '@/stores'

export const useNoticeList = () => {
  const userAuthStore = useUserAuthStore()

  const { data, refresh, ...rest } = useFetchHook({
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

  const { resume } = useTimeoutPoll(refresh, 10 * 60 * 1000, {
    immediate: false,
  })

  onMounted(() => nextTick(resume))

  return {
    noticeList: data as Readonly<ShallowRef<API.NoticeVo[]>>,
    ...rest,
  }
}
