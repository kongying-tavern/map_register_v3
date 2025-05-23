import type { PaginationState } from '@/hooks'
import type { HistoryActionType } from '@/shared'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export const useHistoryList = (options: {
  historyType: Ref<number>
  pagination: Ref<PaginationState>
  editType: Ref<HistoryActionType | undefined>
}) => {
  const { historyType, pagination, editType } = options

  const historyList = shallowRef<API.HistoryVo[]>([])
  const userMap = shallowRef<Record<string, API.SysUserSmallVo>>({})

  const { refresh: updateHistoryList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      const { data: { record = [], total = 0 } = {}, users = {} } = await Api.history.searchHistory({
        type: historyType.value,
        current: pagination.value.current,
        size: pagination.value.pageSize,
        sort: ['updateTime-'],
        editType: editType.value === undefined ? undefined : `${editType.value}`,
      })

      return { list: record, total, users }
    },
  })

  onSuccess(({ list, total, users }) => {
    historyList.value = list
    userMap.value = users
    pagination.value.total = total
  })

  return { historyList, userMap, updateHistoryList, onSuccess, ...rest }
}
