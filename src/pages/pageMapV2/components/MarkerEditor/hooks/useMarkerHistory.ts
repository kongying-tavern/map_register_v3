import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { HistoryRecordType } from '@/shared'

export const useMarkerHistory = (markerVo: Ref<API.MarkerVo>) => {
  /**
   * 当前选择的记录索引，比对器会将该条与上一条进行对比
   * 在 updateTime- 排序模式下，index 越小记录越新
   */
  const selectedHistoryIndex = ref(0)

  // 先加载 100 条，超过 100 就全部加载
  // TODO 后续改为懒加载或虚拟列表
  const { data, refresh, ...rest } = useFetchHook({
    initialValue: {
      record: [],
      users: new Map(),
    },
    onRequest: async () => {
      selectedHistoryIndex.value = 0

      const { id } = toValue(markerVo)
      if (id === undefined)
        throw new Error('点位 id 为空')

      const { data: { record = [], total = 0 } = {}, users: _users = {} } = await Api.history.searchHistory({
        current: 1,
        size: 100,
        id: [id],
        type: HistoryRecordType.MARKER,
        sort: ['updateTime-'],
      })

      if (total > 100) {
        const { data: { record = [] } = {}, users: _users = {} } = await Api.history.searchHistory({
          current: 1,
          size: total,
          id: [id],
          type: HistoryRecordType.MARKER,
          sort: ['updateTime-'],
        })
        const users = new Map(Object.entries(_users))
        return { record, users }
      }

      const users = new Map(Object.entries(_users))

      return { record, users }
    },
  })

  const current = computed(() => {
    const nextHistory = data.value.record[selectedHistoryIndex.value - 1]
    return nextHistory ? JSON.parse(nextHistory.content ?? '{}') as API.MarkerVo : markerVo.value
  })

  const nextDisabled = computed(() => selectedHistoryIndex.value <= 0)

  const preDisabled = computed(() => selectedHistoryIndex.value + 1 >= data.value.record.length)

  const nextRecord = () => {
    if (nextDisabled.value)
      return
    selectedHistoryIndex.value -= 1
  }

  const preRecord = () => {
    if (preDisabled.value)
      return
    selectedHistoryIndex.value += 1
  }

  const history = computed(() => data.value.record[selectedHistoryIndex.value])

  return {
    data,
    current,
    nextDisabled,
    preDisabled,
    nextRecord,
    preRecord,
    refresh,
    history,
    ...rest,
  }
}
