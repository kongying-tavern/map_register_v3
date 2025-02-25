import type { PaginationState } from '@/hooks/usePagination'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ElMessage } from 'element-plus'
import _ from 'lodash'
import { ref } from 'vue'

interface UserListHookOptions {
  pagination: Ref<PaginationState>
  sortInfo: Ref<{ key: string, type: string }>
}

/** 列表数据与核心操作封装 */
export const useUserList = (options: UserListHookOptions) => {
  const { pagination, sortInfo } = options

  const userList = ref<API.SysUserVo[]>([])

  // 搜索
  const filterKey = ref('nickname')
  const filterValue = ref('')

  const { refresh: updateUserList, onSuccess, onError, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => {
      const { current, pageSize: size } = toValue(pagination)
      const { key: sortKey, type: sortType } = toValue(sortInfo)
      const filter = {}
      _.set(filter, filterKey.value, filterValue.value)
      return Api.user.getUserList({
        ...filter,
        sort: [`${sortKey}${sortType}`],
        current,
        size,
      })
    },
  })

  const resetCurrent = async () => {
    pagination.value.current = 1
    await updateUserList()
  }

  onSuccess(({ data: { record = [], total = 0 } = {} }) => {
    userList.value = record
    pagination.value.total = total
  })

  onError((err) => {
    userList.value = []
    ElMessage.error({
      message: `获取结果失败，原因为: ${err.message}`,
    })
  })

  return {
    userList,
    filterKey,
    filterValue,
    updateUserList,
    resetCurrent,
    onError,
    ...rest,
  }
}
