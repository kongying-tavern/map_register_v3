import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { HistoryRecordType } from '@/shared'

export const useMarkerHistory = (markerVo: Ref<API.MarkerVo>) => {
  /**
   * 当前选择的记录索引，比对器会将该条与上一条进行对比
   * 在 updateTime- 排序模式下，current 为 0 时，上一条就是最新记录
   */
  const currentIndex = ref(0)

  // TODO 暂时写死 100 条，后续改为动态加载
  const { data, refresh, ...rest } = useFetchHook({
    initialValue: {
      record: [],
      users: new Map(),
    },
    onRequest: async () => {
      const { id } = toValue(markerVo)
      if (id === undefined)
        throw new Error('点位 id 为空')

      const { data: { record = [] } = {}, users: _users = {} } = await Api.history.searchHistory({
        current: 1,
        size: 100,
        id: [id],
        type: HistoryRecordType.MARKER,
        sort: ['updateTime-'],
      })

      const users = new Map(Object.entries(_users))

      return { record, users }
    },
  })

  const nextHistory = computed(() => {
    return data.value.record[currentIndex.value] as API.HistoryVo | undefined
  })

  const preHistory = computed(() => {
    return data.value.record[currentIndex.value + 1] as API.HistoryVo | undefined
  })

  return {
    currentIndex,
    data,
    preHistory,
    nextHistory,
    refresh,
    ...rest,
  }
}
