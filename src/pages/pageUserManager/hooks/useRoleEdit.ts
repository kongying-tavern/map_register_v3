import type { Ref } from 'vue'
import { UserPasswordEditor } from '../components'
import Api from '@/api/api'
import { useGlobalDialog } from '@/hooks'
import { useRowEdit } from '@/hooks/useTableManipulation'

export interface RoleEditHookOptions {
  userList: Ref<API.SysUserVo[]>
}

/** 用户信息相关业务逻辑封装 */
export const useRoleEdit = (options: RoleEditHookOptions) => {
  const { userList } = options

  const editOptions = useRowEdit({
    rowList: userList,
    saveHandler: async (_, newRowData) => {
      await Api.sysUserController.updateUser({}, newRowData)
    },
  })

  const { DialogService } = useGlobalDialog()

  const openPwdEditorDialog = async (index: number) => {
    await DialogService
      .config({ title: '修改密码', width: '400px', alignCenter: true })
      .props({ user: userList.value[index] })
      .open(UserPasswordEditor)
      .afterClosed<boolean>()
  }

  return { ...editOptions, openPwdEditorDialog }
}
