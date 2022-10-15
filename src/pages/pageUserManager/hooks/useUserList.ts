import { reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import type { QTableProps } from 'quasar'
import { messageFrom } from '@/utils'
import System from '@/api/system'

interface UserListHookOptions {
  immediate?: boolean
  params?: () => API.SysUserSearchVo
  onSuccess?: (res: API.RPageListVoSysUserVo) => void
  onError?: () => void
}

export const useUserList = (options: UserListHookOptions = {}) => {
  const { immediate = true, params, onError, onSuccess } = options

  const $q = useQuasar()

  const userList = ref<API.SysRoleVo[]>([])
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
      const res = await System.sysUserController.getUserList({
        current: paginationParams.page,
        size: paginationParams.rowsPerPage,
        sort: [orderBy.value],
        ...(filterValue.value
          ? { [filterKey.value.value]: filterValue.value }
          : undefined),
        ...params?.(),
      })
      userList.value = res.data?.record ?? []
      paginationParams.rowsNumber = res.data?.total ?? 0
      onSuccess?.(res)
    }
    catch (err) {
      userList.value = []
      paginationParams.rowsNumber = 0
      onError?.()
      $q.notify({
        type: 'negative',
        message: `fetch user list error: ${messageFrom(err)}`,
      })
    }
    finally {
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
