import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { messageFrom } from '@/utils'
import System from '@/api/system'

interface UserListHookOptions {
  /** 是否在组件挂载后立即发起请求 */
  immediate?: boolean
  /** 搜索触发的防抖时间 */
  filterDebounceTime?: number
  /** 自定义请求参数 */
  params?: () => API.SysUserSearchVo
  /** 请求成功后的回调 */
  onSuccess?: (res: API.PageListVoSysUserVo) => void
  /** 请求失败后的回调 */
  onError?: (reqData: API.SysUserSearchVo) => void
}

export const useUserList = (options: UserListHookOptions = {}) => {
  const { immediate = true, filterDebounceTime = 500, params, onError, onSuccess } = options

  const userList = ref<API.SysUserVo[]>([])
  const loading = ref(false)

  // 搜索
  const filterKey = ref('nickname')
  const filterValue = ref('')
  const filterDebounce = refDebounced(filterValue, filterDebounceTime)

  // 排序
  const sorts = ref<('createTime+' | 'createTime-' | 'nickname+' | 'nickname-')[]>(['createTime-'])

  const refresh = async () => {
    loading.value = true
    const requestData: API.SysUserSearchVo = {
      sort: sorts.value,
      ...(filterDebounce.value
        ? { [filterKey.value]: filterDebounce.value }
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

  watch(() => [sorts.value, filterDebounce.value], refresh)

  onMounted(() => {
    immediate && refresh()
  })

  const deleteLoading = ref(false)

  const deleteRow = async (index: number) => {
    try {
      const { id, username } = userList.value[index] ?? {}
      const confirm = await ElMessageBox.confirm(`确认删除用户: ${username} (id: ${id})`).catch(() => false)
      if (!confirm || !id)
        return
      deleteLoading.value = true
      const res = await System.sysUserController.deleteUser({ workId: id })
      ElMessage.success(res.message ?? '删除成功')
      refresh()
    }
    catch (err) {
      ElMessage.error(messageFrom(err))
    }
    finally {
      deleteLoading.value = false
    }
  }

  return {
    userList,
    loading,
    deleteLoading,
    filterKey,
    filterValue,
    sorts,
    refresh,
    deleteRow,
  }
}
