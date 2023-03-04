import type { Ref } from 'vue'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { messageFrom } from '@/utils'
import Api from '@/api/api'

interface UserListHookOptions {
  /** 是否在组件挂载后立即发起请求 */
  immediate?: boolean
  /** 请求成功后的回调 */
  onSuccess?: (res: API.AreaVo[]) => void
  /** 分页数据 */
  pagination?: Ref<{
    total: number
    current: number
    pageSize: number
  }>
}

/** 列表数据与核心操作封装 */
export const useUserList = (options: UserListHookOptions = {}) => {
  const { immediate = true, pagination = ref(), onSuccess } = options

  const areaList = ref<API.AreaVo[]>([])
  const parents = ref<API.AreaVo[]>([])
  const loading = ref(false)
  const params = ref<API.AreaSearchVo>({ parentId: -1 })

  const refresh = async () => {
    loading.value = true
    try {
      const { data = [] } = await Api.area.listArea({}, { ...params.value, isTraverse: true } as API.AreaSearchVo)
      if (pagination.value) {
        pagination.value.total = data.length
        areaList.value = data.slice((pagination.value.current - 1) * pagination.value.pageSize, pagination.value.current * pagination.value.pageSize)
      }
      const { data: parentData = [] } = await Api.area.listArea({}, { parentId: -1, isTraverse: false })
      parents.value = parentData ?? []
      onSuccess?.(data)
    }
    catch (err) {
      ElMessage.error(messageFrom(err))
    }
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    immediate && refresh()
  })

  watch(params, () => {
    refresh()
  }, { deep: true })

  watch(pagination, () => {
    refresh()
  }, { deep: true })

  const deleteLoading = ref(false)

  const deleteRow = async (index: number) => {
    try {
      const { areaId, name } = areaList.value[index] ?? {}
      const confirm = await ElMessageBox.confirm(`确认删除地区: ${name} (id: ${areaId})`).catch(() => false)
      if (!confirm || areaId === undefined)
        return
      deleteLoading.value = true
      const res = await Api.area.deleteArea({ areaId })
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
    areaList,
    loading,
    params,
    parents,
    deleteLoading,
    refresh,
    deleteRow,
  }
}
