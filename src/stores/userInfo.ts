import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { ROLE_MASK_MAP, RoleTypeEnum } from '@/shared'
import { useUserAuthStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'

const FALLBACK_ROLE: API.SysRoleVo = Object.freeze({
  code: RoleTypeEnum.VISITOR,
  name: '游客',
})

export const useUserInfoStore = defineStore('global-user-info', () => {
  const userAuthStore = useUserAuthStore()

  // ==================== 用户角色信息 ====================
  const { data: roleList, refresh: updateRoleList, onError: onRoleUpdateError } = useFetchHook({
    initialValue: [],
    onRequest: async () => {
      const { data = [] } = await Api.role.listRole()
      if (!data.length)
        throw new Error('角色列表为空')
      return data
    },
  })

  onRoleUpdateError((err) => {
    ElMessage.error({
      message: `获取角色信息失败，原因为：${err.message}`,
    })
  })

  const roleMap = computed(() => roleList.value.reduce((map, role) => {
    return map.set(role.id!, role)
  }, new Map<number, API.SysRoleVo>()))

  roleList.value.reduce((map, role) => map.set(role.id!, role), new Map<number, API.SysRoleVo>())

  // ==================== 用户基本信息 ====================
  const showUserInfo = ref(false)

  const {
    data: info,
    refresh: updateUserInfo,
    onError: onUserInfoUpdateError,
  } = useFetchHook({
    initialValue: {},
    onRequest: async () => {
      if (!userAuthStore.validateToken())
        return {}
      const { data = {} } = await Api.user.getUserInfo({ userId: userAuthStore.auth.userId! })
      return data
    },
  })

  onUserInfoUpdateError((err) => {
    ElMessage.error({
      message: `获取用户信息失败，原因为：${err.message}`,
    })
  })

  const userRole = computed<API.SysRoleVo>(() => {
    return roleMap.value.get(info.value.roleId ?? -1) ?? FALLBACK_ROLE
  })

  const userRoleLevel = computed(() => {
    return ROLE_MASK_MAP[userRole.value.code ?? ''] ?? ROLE_MASK_MAP.VISITOR
  })

  /** 判断用户是否具有大于指定权限等级的权限 */
  const hasRole = (role: string) => {
    return userRoleLevel.value >= ROLE_MASK_MAP[role]
  }

  const init = async () => {
    await updateRoleList()
    await updateUserInfo()
    watch(() => userAuthStore.auth.userId, updateUserInfo)
  }

  return {
    // states
    showUserInfo,
    info,
    roleList,

    // getters
    roleMap,
    userRole,
    userRoleLevel,

    // actions
    updateUserInfo,
    updateRoleList,
    hasRole,
    init,
  }
})
