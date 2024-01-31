import { ref } from 'vue'
import _ from 'lodash'
import type { PaginationState } from '@/hooks/usePagination'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

interface UserListHookOptions {
  getParams: () => Omit<API.SysUserSearchVo, 'current' | 'size'>
  pagination: Ref<PaginationState>
}

/** 列表数据与核心操作封装 */
export const useUserList = (options: UserListHookOptions) => {
  const { pagination, getParams } = options

  const userList = ref<API.SysUserVo[]>([])

  // 搜索
  const filterKey = ref('nickname')
  const filterValue = ref('')

  const params = computed(() => getParams())

  const { refresh: updateUserList, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => {
      const { current, pageSize: size } = pagination.value
      const filter = {}
      _.set(filter, filterKey.value, filterValue.value)
      return Api.sysUserController.getUserList({
        ...filter,
        ...params.value,
        current,
        size,
      })
    },
  })

  onSuccess(({ data: { record = [], total = 0 } = {} }) => {
    userList.value = record
    pagination.value.total = total
  })

  watch(() => params.value.sort, updateUserList, { deep: true })

  return {
    userList,
    filterKey,
    filterValue,
    updateUserList,
    ...rest,
  }
}
