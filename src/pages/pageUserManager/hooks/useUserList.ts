import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { messageFrom } from '@/utils'
import System from '@/api/system'

interface UserListHookOptions {
  immediate?: boolean
  params?: () => API.SysUserSearchVo
  onSuccess?: (res: API.PageListVoSysUserVo) => void
  onError?: (reqData: API.SysUserSearchVo) => void
}

export const useUserList = (options: UserListHookOptions = {}) => {
  const { immediate = true, params, onError, onSuccess } = options

  const userList = ref<API.SysUserVo[]>([])
  const loading = ref(false)
  const orderBy = ref<'nickname+' | 'createTime+' | 'nickname-' | 'createTime-'>('createTime-')
  const filterKey = ref({ label: '昵称', value: 'nickname' })
  const filterValue = ref('')

  const refresh = async () => {
    loading.value = true
    const requestData: API.SysUserSearchVo = {
      sort: [orderBy.value],
      ...(filterValue.value
        ? { [filterKey.value.value]: filterValue.value }
        : undefined),
      ...params?.(),
    }
    try {
      const { data = {} } = await System.sysUserController.getUserList(requestData)
      userList.value = data.record ?? []
      onSuccess?.(data)
    }
    catch (err) {
      onError?.(requestData)
      ElMessage.error(messageFrom(err))
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    immediate && refresh()
  })

  return {
    userList,
    loading,
    orderBy,
    filterKey,
    filterValue,
    refresh,
  }
}
