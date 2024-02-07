import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { routerHook, userHook } from './hooks'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserAuthStore } from '@/stores'
import { RoleLevel, RoleTypeEnum } from '@/shared'

export const useUserInfoStore = defineStore('global-user-info', () => {
  const userAuthStore = useUserAuthStore()

  // ==================== 用户角色信息 ====================
  const { data: roleList, refresh: updateRoleList, onError: onRoleUpdateError } = useFetchHook({
    initialValue: [],
    onRequest: async () => {
      const { data = [] } = await Api.role.listRole()
      return data
    },
  })

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

  const {
    data: info,
    refresh: updateUserInfo,
    onError: onUserInfoUpdateError,
    onSuccess: onUserInfoUpdateSuccess,
  } = useFetchHook({
    initialValue: {},
    onRequest: async () => {
      const { userId } = userAuthStore.auth
      if (userId === undefined)
        throw new Error('用户凭证中的用户 id 为空')
      const { data = {} } = await Api.sysUserController.getUserInfo({ userId })
      return data
    },
  })

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
  const isLogin = useUserAuthStore().validateToken()
  isLogin && await store.updateUserInfo()
  isLogin && await store.updateRoleList()
})
