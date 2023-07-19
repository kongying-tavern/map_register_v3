import type { PaginationState } from '@/hooks'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export interface IconTagListHookOptions {
  pagination: Ref<PaginationState>
  getParams: () => Omit<API.TagSearchVo, 'current' | 'size'>
}

export const useIconTagList = (options: IconTagListHookOptions) => {
  const { pagination, getParams } = options

  const params = computed(() => getParams())

  const iconTagList = ref<API.TagVo[]>([])
  const userMap = ref<Record<string, API.SysUserSmallVo>>({})

  const { refresh: updateTagLIst, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => Api.tag.listTag({
      current: pagination.value.current,
      size: pagination.value.pageSize,
      ...params.value,
    }),
  })

  const refreshWithResetCurrent = async () => {
    pagination.value.current = 1
    await updateTagLIst()
  }

  watch(() => params.value.typeIdList, refreshWithResetCurrent)
  watchDebounced(() => params.value.tagList, refreshWithResetCurrent, { debounce: 500 })

  onSuccess(({ data: { record = [], total = 0 } = {}, users = {} }) => {
    iconTagList.value = record
    pagination.value.total = total
    userMap.value = users
  })

  return { iconTagList, userMap, updateTagLIst, onSuccess, ...rest }
}
