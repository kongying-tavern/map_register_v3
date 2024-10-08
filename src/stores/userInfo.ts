import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { routerHook, userHook } from './hooks'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useUserAuthStore } from '@/stores'
import { RoleLevel, RoleTypeEnum } from '@/shared'

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
      const { userId } = userAuthStore.auth
      if (userId === undefined)
        throw new Error('用户凭证中的用户 id 为空')
      const { data = {} } = await Api.user.getUserInfo({ userId })
      return data
    },
  })

  watch(info, () => userHook.applyCallbacks('onInfoChange'), { deep: true })

  onUserInfoUpdateError((err) => {
    ElMessage.error({
      message: `获取用户信息失败，原因为：${err.message}`,
    })
  })

  const userRole = computed<API.SysRoleVo>(() => {
    return roleMap.value.get(info.value.roleId ?? -1) ?? FALLBACK_ROLE
  })

  const userRoleLevel = computed(() => {
    return RoleLevel[userRole.value.code as RoleTypeEnum] ?? RoleLevel.VISITOR
  })

  /** 判断用户是否具有大于指定权限等级的权限 */
  const hasRole = (role: RoleTypeEnum) => {
    return userRoleLevel.value >= RoleLevel[role]
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
  }
})

userHook.onAuthChange(useUserInfoStore, async (store) => {
  const userAuthStore = useUserAuthStore()
  const isLogin = userAuthStore.validateToken()
  if (!isLogin) {
    store.info = {}
    return
  }

  // 仅当 roleList 为空时重新拉取
  !store.roleList.length && await store.updateRoleList()

  // 仅当 userId 发生变化时重新拉取
  store.info.id !== userAuthStore.auth.userId && await store.updateUserInfo()
})

routerHook.onBeforeRouterEnter(useUserInfoStore, async (store) => {
  const isLogin = useUserAuthStore().validateToken()
  if (!isLogin)
    return

  if (!store.roleList.length) {
    const rolsList = await store.updateRoleList()
    if (!rolsList)
      throw new Error('无法获取角色列表')
  }

  if (store.info.id === undefined) {
    const userInfo = await store.updateUserInfo()
    if (!userInfo)
      throw new Error('无法获取用户信息')
  }
})
