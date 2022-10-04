import { reactive, ref } from 'vue'
import { fetchUserList } from '@/api/system/user'
import { useQuasar } from 'quasar'
import { messageFrom } from '@/utils'
import type { UserData, UserListReq, UserListRes } from '@/api/system/user'
import type { QTableProps } from 'quasar'

interface UserListHookOptions {
  immediate?: boolean
  params?: () => UserListReq
  onSuccess?: (res: UserListRes) => void
  onError?: () => void
}

export const useUserList = (options: UserListHookOptions = {}) => {
  const { immediate = true, params, onError, onSuccess } = options

  const $q = useQuasar()

  const userList = ref<UserData[]>([])
  const loading = ref(false)
  const orderBy = ref<
    'nickname+' | 'createTime+' | 'nickname-' | 'createTime-'
  >('createTime-')
  const filterKey = ref({ label: '昵称', value: 'nickname' })
  const filterValue = ref('')
  const paginationParams = reactive<
    Required<Required<QTableProps>['pagination']>
  >({
    descending: false,
    sortBy: 'desc',
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  })

  const refresh = async () => {
    loading.value = true
    try {
      const res = await fetchUserList({
        current: paginationParams.page,
        size: paginationParams.rowsPerPage,
        sort: [orderBy.value],
        ...(filterValue.value
          ? { [filterKey.value.value]: filterValue.value }
          : undefined),
        ...params?.(),
      })
      userList.value = res.data.record
      paginationParams.rowsNumber = res.data.total
      onSuccess?.(res)
    } catch (err) {
      userList.value = []
      paginationParams.rowsNumber = 0
      onError?.()
      $q.notify({
        type: 'negative',
        message: `fetch user list error: ${messageFrom(err)}`,
      })
    } finally {
      loading.value = false
    }
  }

  immediate && refresh()

  return {
    userList,
    loading,
    paginationParams,
    orderBy,
    filterKey,
    filterValue,
    refresh,
  }
}
