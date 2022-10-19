import { ref } from 'vue'
import { ElMessage } from 'element-plus'
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

  return {
    userList,
    loading,
    filterKey,
    filterValue,
    sorts,
    refresh,
  }
}
