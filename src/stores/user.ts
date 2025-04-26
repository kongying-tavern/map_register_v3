import type { MessageHandler } from 'element-plus'
import Api from '@/api/api'
import Oauth from '@/api/oauth'
import { AppLogin } from '@/components'
import { useFetchHook, useGlobalDialog } from '@/hooks'
import { ROLE_MASK_MAP, USERAUTH_KEY } from '@/shared'
import { Logger } from '@/utils'
import { ElMessage } from 'element-plus'
import { camelCase } from 'lodash'
import { defineStore } from 'pinia'
import { from, lastValueFrom, retry } from 'rxjs'

interface AppUserAuth {
  refreshToken: string
  userId: number
  expiresIn: number
  expiresTime: number
  accessToken: string
  tokenType: string
}

const logger = new Logger('鉴权')

/** token 刷新间隔 (ms) */
const REFRESH_INTERVAL = 20 * 60 * 1000

/** token 过期判断时间精度豁免 (ms) */
const RESTTIME_PRECISION = 4

/** 计算到期时间 */
const getExpiressTime = (expiressIn: number) => Date.now() + expiressIn * 1000

const toCamelCaseObject = <T extends Record<string, unknown>>(obj: T): SnakeCaseKeysToCamelCase<T> => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [camelCase(key), value])) as SnakeCaseKeysToCamelCase<T>
}

export const useUserStore = defineStore('global-user', () => {
  const { DialogService } = useGlobalDialog()

  // ==================== token ====================
  const auth = useLocalStorage<Partial<AppUserAuth>>(USERAUTH_KEY, {})

  const setAuth = (newAuth: API.SysToken) => {
    const { refreshToken, userId, expiresIn, tokenType, accessToken } = toCamelCaseObject(newAuth)
    auth.value = {
      refreshToken,
      expiresIn,
      expiresTime: getExpiressTime(expiresIn),
      userId,
      accessToken,
      tokenType,
    }
  }

  // ==================== 角色信息 ====================
  const { data: roleList, loading: roleListLoading, refresh: refreshRoleList } = useFetchHook({
    initialValue: [],
    shallow: true,
    onRequest: async () => {
      const { data: newRoleList = [] } = await Api.role.listRole()
      return newRoleList
    },
  })

  const roleMap = computed(() => roleList.value.reduce((map, role) => {
    return map.set(role.id!, role)
  }, new Map<number, API.SysRoleVo>()))

  // ==================== 用户信息 ====================
  const { data: info, loading: isInfoLoading, refresh: refreshUserInfo, onError: onFetchInfoError } = useFetchHook({
    shallow: true,
    initialValue: null,
    onRequest: async (userId: number | undefined = auth.value.userId) => {
      if (!userId)
        return null

      if (!roleList.value.length)
        await refreshRoleList()

      const { data = {} } = await Api.user.getUserInfo({ userId })
      const { roleId = -1, username = '', ...rest } = data
      const role = roleMap.value.get(roleId)

      return {
        id: userId,
        username,
        role: role
          ? {
              ...role,
              mask: ROLE_MASK_MAP[role.code!],
            }
          : undefined,
        roleId,
        ...rest,
      }
    },
  })

  const logoutMessageHandler = shallowRef<MessageHandler>()

  const login = async (form: API.SysTokenVO) => {
    const authData = await Oauth.oauth.token(form)
    setAuth(authData)
    logoutMessageHandler.value?.close()
    return authData
  }

  const clearLoginState = () => {
    auth.value = {}
    info.value = null
    logoutMessageHandler.value?.close()
  }

  const validateToken = () => {
    const { expiresTime = 0 } = auth.value
    return expiresTime > Date.now()
  }

  const beforeLogout = createEventHook<void>()

  const logout = async () => {
    beforeLogout.trigger()
    clearLoginState()
    logoutMessageHandler.value = ElMessage({
      type: 'warning',
      message: '已退出',
      duration: 10 * 1000,
      showClose: true,
      onClose: () => {
        logoutMessageHandler.value = undefined
      },
    })
  }

  onFetchInfoError(() => {
    logout()
  })

  const refreshToken = async (onCancel?: () => void) => {
    if (!auth.value.refreshToken) {
      onCancel?.()
      return
    }
    // 刷新时间如果大于阈值，跳过并等待下一轮刷新
    if ((auth.value.expiresTime! - Date.now()) > (REFRESH_INTERVAL + RESTTIME_PRECISION))
      return
    const res = await lastValueFrom(from(Oauth.oauth.refresh({
      grant_type: 'refresh_token',
      refresh_token: auth.value.refreshToken,
    })).pipe(retry({ count: 3, delay: 50 }))).catch(() => null)
    // 如果刷新失败，清空凭证并退出
    if (!res) {
      onCancel?.()
      logout()
      return
    }
    logger.info('token 已刷新')
    setAuth(res)
  }

  // 自动刷新 token
  const {
    isActive: isAutoRefreshActive,
    pause: pauseRefreshToken,
    resume: resumeRefreshToken,
  } = useTimeoutPoll(() => refreshToken(() => pauseRefreshToken()), REFRESH_INTERVAL)

  const onBeforeLogout = (fn: () => void) => {
    tryOnMounted(() => {
      beforeLogout.on(fn)
    })
    tryOnUnmounted(() => {
      beforeLogout.off(fn)
    })
  }

  const init = async () => {
    if (auth.value.refreshToken) {
      await refreshToken()
      resumeRefreshToken()
    }

    // 启用/暂停 token 自动刷新
    // 自动弹出登录窗口
    watch(() => auth.value.refreshToken, async (newToken, oldToken) => {
      if (!newToken) {
        pauseRefreshToken()
        logger.info('token 刷新已暂停')
        DialogService.open(AppLogin)
        return
      }
      if (!oldToken) {
        logger.info('token 刷新已启用')
        resumeRefreshToken()
      }
    }, { immediate: true })

    // 自动更新用户信息
    watch(() => auth.value.userId, refreshUserInfo, { immediate: true })
  }

  return {
    // states
    auth,
    roleList,
    roleListLoading,
    roleMap,
    info,
    isInfoLoading,
    isAutoRefreshActive,

    // actions
    setAuth,
    clearAuth: clearLoginState,
    validateToken,
    refreshToken,
    refreshUserInfo,
    login,
    logout,
    onBeforeLogout,
    init,
  }
})
