import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
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

  const { refresh: updateNoticeList, onSuccess, onError, ...rest } = useFetchHook({
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

  const resetCurrent = async () => {
    pagination.value.current = 1
    await updateNoticeList()
  }

  onSuccess(({ data: { record = [], total = 0 } = {} }) => {
    mainTableData.value = record
    pagination.value.total = total
  })

  onError((err) => {
    mainTableData.value = []
    ElMessage.error({
      message: `获取结果失败，原因为: ${err.message}`,
      offset: 48,
    })
  })

  return {
    mainTableData,
    updateNoticeList,
    resetCurrent,
    onError,
    ...rest,
  }
}
