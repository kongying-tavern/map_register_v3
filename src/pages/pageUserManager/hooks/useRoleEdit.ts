import type { Ref } from 'vue'
import { omit } from 'lodash'
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
    saveHandler: async (_, newRowData, oldRowData) => {
      const { id: userId, roleList = [] } = newRowData
      const rest = omit(newRowData, 'id', 'username', 'roleList')
      // 更新用户信息需要的全部请求
      const mission = [
        // 修改用户信息
        Api.sysUserController.updateUser({}, { ...rest, userId }),
      ]
      const [newRoleId, oldRoleId] = [roleList[0]?.id, oldRowData?.roleList?.[0]?.id]
      const isRoleDiff = newRoleId !== oldRoleId
      if (isRoleDiff) {
        // 修改用户角色
        mission.push(Api.role.addRoleToUser({ userId, roleId: newRoleId }))
      }
      await Promise.allSettled(mission)
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
