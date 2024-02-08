import { ref } from 'vue'
import _ from 'lodash'
import type { PaginationState } from '@/hooks/usePagination'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

interface UserListHookOptions {
  pagination: Ref<PaginationState>
}

/** 列表数据与核心操作封装 */
export const useUserList = (options: UserListHookOptions) => {
  const { pagination } = options

  const userList = ref<API.SysUserVo[]>([])

  // 搜索
  const filterKey = ref('nickname')
  const filterValue = ref('')
  const sort = ref<string[]>([])

  const { refresh: updateUserList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => {
      const { current, pageSize: size } = pagination.value
      const filter = {}
      _.set(filter, filterKey.value, filterValue.value)
      return Api.sysUserController.getUserList({
        ...filter,
        sort: sort.value,
        current,
        size,
      })
    },
  })

  const onSortChange = async (sortKeys: string[]) => {
    sort.value = sortKeys
    await updateUserList()
  }

  onSuccess(({ data: { record = [], total = 0 } = {} }) => {
    userList.value = record
    pagination.value.total = total
  })

  return {
    userList,
    filterKey,
    filterValue,
    onSortChange,
    updateUserList,
    ...rest,
  }
}
