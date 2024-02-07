import { ElMessage } from 'element-plus'
import Api from '@/api/api'
import type { PaginationState } from '@/hooks'
import { useFetchHook } from '@/hooks'

export interface IconListHookOptions {
  pagination: Ref<PaginationState>
  getParams: () => Omit<API.IconSearchVo, 'current' | 'size'>
}

/** 图标列表 hook */
export const useIconList = (options: IconListHookOptions) => {
  const { pagination, getParams } = options

  const iconList = ref<API.IconVo[]>([])
  const userMap = ref<Record<string, API.SysUserSmallVo>>({})

  const { refresh: updateIconList, onSuccess, onError, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => Api.icon.listIcon({
      ...getParams(),
      current: pagination.value.current,
      size: pagination.value.pageSize,
    }),
  })

  const updateIconListWithResetCurrent = async () => {
    pagination.value.current = 1
    await updateIconList()
  }

  onSuccess(({ data: { record = [], total = 0 } = {}, users = {} }) => {
    iconList.value = record
    userMap.value = users
    pagination.value.total = total
  })

  onError(err => ElMessage.error({
    message: `更新图标列表失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { iconList, userMap, updateIconList, updateIconListWithResetCurrent, onSuccess, ...rest }
}
