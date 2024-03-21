import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import type { PaginationState } from '@/hooks/usePagination'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

interface ListHookOptions {
  getParams: () => Omit<API.NoticeSearchVo, 'current' | 'size'>
  pagination: Ref<PaginationState>
}

/** 列表数据与核心操作封装 */
export const useList = (options: ListHookOptions) => {
  const { pagination, getParams } = options

  const mainTableData = ref<API.NoticeVo[]>([])

  const params = computed(() => getParams())

  const { refresh: updateNoticeList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => {
      const { current, pageSize: size } = pagination.value
      return Api.notice.listNotice({
        ...params.value,
        current,
        size,
      })
    },
  })

  onSuccess(({ data: { record = [], total = 0 } = {} }) => {
    mainTableData.value = record
    pagination.value.total = total
  })

  return {
    mainTableData,
    updateNoticeList,
    ...rest,
  }
}
