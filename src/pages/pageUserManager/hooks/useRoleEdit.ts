import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash'
import type { Ref } from 'vue'
import { messageFrom } from '@/utils'
import System from '@/api/system'

export interface RoleEditHookOptions {
  userList: Ref<API.SysUserVo[]>
}

export const useRoleEdit = (options: RoleEditHookOptions) => {
  const { userList } = options

  /** 请求状态 */
  const editLoading = ref(false)
  /** 在行进入编辑状态的时候缓存一下原始数据 */
  const rowCache = ref<API.SysUserVo | null>(null)
  /** 根据修改状态决定是否需要在退出编辑状态的时候恢复原始数据 */
  const resetFlag = ref(true)

  /** 当前正在编辑的行索引 */
  const _editIndex = ref(-1)
  /** 当前正在编辑的行索引的代理，用于在退出编辑时进行一些处理 */
  const editIndex = computed({
    get: () => _editIndex.value,
    set: (index) => {
      if (index !== -1) {
        rowCache.value = cloneDeep(userList.value[index])
        resetFlag.value = true
      }
      _editIndex.value = index
    },
  })

  const isEditable = (index: number) => {
    return index === editIndex.value
  }

  const activeEdit = (index: number) => {
    editIndex.value = index
  }

  const exitEdit = () => {
    editIndex.value = -1
  }

  useEventListener(window, 'click', () => {
    if (resetFlag.value && rowCache.value)
      userList.value[editIndex.value] = rowCache.value
    exitEdit()
  })

  const saveEdit = async () => {
    if (editIndex.value === -1)
      return
    try {
      editLoading.value = true
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, username, roleList, ...rest } = userList.value[editIndex.value]
      const res = await System.sysUserController.updateUser({}, {
        ...rest,
        userId: id,
      })
      resetFlag.value = false
      exitEdit()
      ElMessage.success(res.message ?? '修改成功')
    }
    catch (err) {
      ElMessage.error(messageFrom(err))
    }
    finally {
      editLoading.value = false
    }
  }

  return { editIndex, editLoading, isEditable, saveEdit, activeEdit, exitEdit }
}
