import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { routerHook, userHook } from './hooks'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserAuthStore } from '@/stores'
import { RoleLevel, RoleTypeEnum } from '@/shared'

export const useUserInfoStore = defineStore('global-user-info', () => {
  // ==================== 用户角色信息 ====================
  const { data: roleList, refresh: _updateRoleList, onError: onRoleUpdateError } = useFetchHook({
    initialValue: [],
    onRequest: async () => {
      const { data = [] } = await Api.role.listRole()
      return data
    },
  })

  const updateRoleList = async () => {
    const { validateToken } = useUserAuthStore()
    if (!validateToken())
      return
    await _updateRoleList()
  }

  onRoleUpdateError((err) => {
    ElMessage.error({
      message: `获取角色信息失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  const roleMap = computed(() => roleList.value.reduce((seed, role) => {
    seed[role.id!] = role
    return seed
  }, {} as Record<number, API.SysRoleVo>))

  // ==================== 用户基本信息 ====================
  const showUserInfo = ref(false)

  const { data: info, refresh: _updateUserInfo, onError: onUserInfoUpdateError, onSuccess: onUserInfoUpdateSuccess } = useFetchHook<API.SysUserVo, [userId: number]>({
    initialValue: {},
    onRequest: async (userId: number) => {
      const { data = {} } = await Api.sysUserController.getUserInfo({ userId })
      return data
    },
  })

  /**
   * 更新用户信息
   * @note 当检测到角色列表为空时，该方法会自动调用更新角色列表的方法
   */
  const updateUserInfo = async () => {
    const { auth } = useUserAuthStore()
    if (auth.userId === undefined || auth.userId === info.value.id)
      return
    await _updateUserInfo(auth.userId)
    if (!roleList.value.length)
      await updateRoleList()
  }

  onUserInfoUpdateSuccess(async () => {
    await userHook.applyCallbacks('onInfoChange')
  })

  onUserInfoUpdateError((err) => {
    ElMessage.error({
      message: `获取用户信息失败，原因为：${err.message}`,
      offset: 48,
    })
  })

  const userRole = computed(() => {
    if (info.value.roleId === undefined)
      return
    return roleMap.value[info.value.roleId]
  })

  const userRoleLevel = computed(() => {
    if (!userRole.value)
      return 0
    return RoleLevel[userRole.value.code as RoleTypeEnum]
  })

  /** 判断用户是否具有大于指定权限等级的权限 */
  const hasRole = (role: RoleTypeEnum) => {
    return userRoleLevel.value >= RoleLevel[role]
  }

  // ==================== 一些快捷权限判断 ====================
  const isAdmin = computed(() => hasRole(RoleTypeEnum.ADMIN))
  const isManager = computed(() => hasRole(RoleTypeEnum.MAP_MANAGER))
  const isNeigui = computed(() => hasRole(RoleTypeEnum.MAP_NEIGUI))
  const isDadian = computed(() => hasRole(RoleTypeEnum.MAP_PUNCTUATE))

  return {
    // states
    showUserInfo,
    info,
    roleList,

    // getters
    roleMap,
    userRole,
    userRoleLevel,
    isAdmin,
    isManager,
    isNeigui,
    isDadian,

    // actions
    updateUserInfo,
    updateRoleList,
    hasRole,
  }
})

routerHook.onBeforeRouterEnter(useUserInfoStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() && await store.updateUserInfo()
})
