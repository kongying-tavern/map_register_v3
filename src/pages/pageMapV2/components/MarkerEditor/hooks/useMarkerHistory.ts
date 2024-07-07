import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { HistoryRecordType } from '@/shared'

/**
 * 注意，该 hook 静态复制了初次传入的表单值，刷新需要主动调用 `refreshSource`
 */
export const useMarkerHistory = (markerVo: Ref<API.MarkerVo>) => {
  const clonedMarkerVo = ref(JSON.parse(JSON.stringify(markerVo.value)) as API.MarkerVo)

  const refreshSource = () => {
    clonedMarkerVo.value = JSON.parse(JSON.stringify(markerVo.value)) as API.MarkerVo
  }

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

      const { id } = toValue(clonedMarkerVo)
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

  const nextDisabled = computed(() => selectedHistoryIndex.value <= 0)

  const preDisabled = computed(() => selectedHistoryIndex.value >= data.value.record.length)

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

  const currentHistory = computed(() => {
    return data.value.record[selectedHistoryIndex.value - 1] as API.HistoryVo | undefined
  })

  const current = computed(() => {
    const currentHistory = data.value.record[selectedHistoryIndex.value - 1] as API.HistoryVo | undefined
    return currentHistory ? JSON.parse(currentHistory.content ?? '{}') as API.MarkerVo : clonedMarkerVo.value
  })

  const currentTime = computed(() => {
    return currentHistory.value?.updateTime ?? clonedMarkerVo.value.updateTime
  })

  const history = computed(() => {
    // 如果历史记录是初始那条，则其记录的 content 是创建时的表单而非修改前的表单
    return data.value.record[selectedHistoryIndex.value] ?? data.value.record[selectedHistoryIndex.value - 1] as API.HistoryVo | undefined
  })

  return {
    data,
    current,
    currentTime,
    nextDisabled,
    preDisabled,
    refreshSource,
    nextRecord,
    preRecord,
    refresh,
    history,
    ...rest,
  }
}
