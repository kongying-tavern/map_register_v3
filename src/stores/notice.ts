import Api from '@/api/api'
import { context as noticeContext } from '@/components/AppNotice/context'
import { useFetchHook } from '@/hooks'
import { NoticeChannel } from '@/shared'
import { defineStore } from 'pinia'
import { usePreferenceStore, useSocketStore, useUserStore } from '.'

export const useNoticeStore = defineStore('global-notice', () => {
  const userStore = useUserStore()
  const socketStore = useSocketStore()
  const preferenceStore = usePreferenceStore()

  const { data: noticeList, refresh, onSuccess, ...rest } = useFetchHook({
    shallow: true,
    initialValue: [],
    onRequest: async () => {
      const { data: { record = [] } = {} } = await Api.notice.listNotice({
        channels: [NoticeChannel.COMMON, NoticeChannel.DASHBOARD],
        sort: ['sortIndex-'],
        getValid: true,
        size: 100,
      })
      return record
    },
    diff: (oldData, newData) => {
      return JSON.stringify(oldData) === JSON.stringify(newData)
    },
  })

  const noticeIdMap = computed(() => noticeList.value.reduce((map, notice) => {
    map.set(notice.id!, notice)
    return map
  }, new Map<number, API.NoticeVo>()))

  const clear = () => {
    noticeContext.close()
    noticeList.value = []
  }

  // 作为 ws 推送挂掉时的 fallback，定时刷新公告
  const { resume, pause } = useTimeoutPoll(async () => {
    await refresh()
  }, 20 * 60 * 1000, { immediate: false })

  const readArchive = computed(() => preferenceStore.noticeRead.reduce((record, [id, time]) => {
    record.set(id, time)
    return record
  }, new Map<number, number>()))

  const isRead = computed(() => (id: number) => {
    const notice = noticeIdMap.value.get(id)
    if (!notice)
      return false

    const readTime = readArchive.value.get(id)
    if (readTime === undefined)
      return false

    return readTime >= Number(notice.updateTime)
  })

  /** 未被阅读过的新公告数量 */
  const newCount = computed(() => noticeList.value.reduce((sum, notice) => {
    const readTime = readArchive.value.get(notice.id!)
    if (readTime === undefined || readTime < Number(notice.updateTime))
      sum++
    return sum
  }, 0))

  const read = (id: number) => {
    const notice = noticeIdMap.value.get(id)
    if (!notice)
      return

    if (isRead.value(id))
      return

    const readMap = new Map(readArchive.value)
    readMap.set(id, Number(notice.updateTime))

    preferenceStore.noticeRead = [...readMap.entries()]
  }

  const selected = shallowRef<API.NoticeVo>()

  onSuccess(async (list) => {
    const [first] = list
    selected.value = first

    const maxUpdateTime = list.reduce((lastTime, notice) => {
      const updateTime = Number(notice.updateTime)
      return updateTime > lastTime ? updateTime : lastTime
    }, 0)

    if (preferenceStore.noticeShowTime >= maxUpdateTime)
      return

    preferenceStore.noticeShowTime = maxUpdateTime
    noticeContext.show()
  })

  socketStore.appEvent.on('NoticeAdded', refresh)
  socketStore.appEvent.on('NoticeDeleted', refresh)
  socketStore.appEvent.on('NoticeUpdated', refresh)

  watch(() => userStore.info?.id, (userId) => {
    if (userId === undefined) {
      clear()
      pause()
      return
    }
    resume()
  }, { immediate: true })

  return {
    newCount,
    selected,
    noticeList,
    noticeIdMap,
    readArchive,
    isRead,
    read,
    clear,
    refresh,
    pause,
    resume,
    onSuccess,
    show: noticeContext.show,
    close: noticeContext.close,
    ...rest,
  }
})
