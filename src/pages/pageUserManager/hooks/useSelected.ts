import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Api from '@/api/api'
import { messageFrom } from '@/utils'

export interface SelectedHookOptions {
  onBatchDeleteSuccess?: () => void
}

/**
 * 行选择相关逻辑封装
 * @todo 批量删除后续可能会添加单独的接口
 */
export const useSelected = (options: SelectedHookOptions = {}) => {
  const { onBatchDeleteSuccess } = options

  const selected = ref<API.SysUserVo[]>([])
  const selectedText = computed(() => selected.value.length ? `已选择 ${selected.value.length} 个用户` : '')
  const batchDeleteLoading = ref(false)

  const changeSelected = (list: API.SysUserVo[]) => {
    selected.value = list
  }

  const batchDelete = async () => {
    if (!selected.value.length)
      return
    const res = await ElMessageBox.confirm(`共有 ${selected.value.length} 个用户将被删除，确认操作？`, '批量删除').catch(() => false)
    if (!res)
      return
    const missions = selected.value.map(({ id }) => {
      if (!id)
        return undefined
      return Api.sysUserController.deleteUser({ workId: id })
    })
    try {
      batchDeleteLoading.value = true
      await Promise.allSettled(missions)
      ElMessage.success('删除成功')
      onBatchDeleteSuccess?.()
    }
    catch (err) {
      ElMessage.error({
        message: `删除用户失败，原因为：${messageFrom(err)}`,
        offset: 48,
      })
    }
    finally {
      batchDeleteLoading.value = false
    }
  }

  return { selected, selectedText, batchDeleteLoading, batchDelete, changeSelected }
}
