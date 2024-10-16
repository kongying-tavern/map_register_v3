import { defineStore } from 'pinia'
import { camelCase } from 'lodash'
import { Logger } from '@/utils'
import Oauth from '@/api/oauth'
import { ROLE_MASK_MAP, USERAUTH_KEY } from '@/shared'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

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
  // ==================== token ====================
  const auth = useLocalStorage<AppUserAuth | Partial<AppUserAuth>>(USERAUTH_KEY, {})

  const isLogin = computed(() => Boolean(auth.value.userId !== undefined))

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

  const clearAuth = () => {
    // FIXME 下面这行会导致 vue runtime 调用 window.close 使得页面关闭（有时候会被阻止），暂时不知道为什么。
    // 目前已在 index.html 中将 window.close 改为空函数来缓解此问题。
    auth.value = null
  }

  const validateToken = () => {
    if (!auth.value)
      return false
    const { expiresTime = 0 } = auth.value
    return expiresTime > Date.now()
  }

  const refreshToken = async (onCancel?: () => void) => {
    if (!auth.value.refreshToken) {
      onCancel?.()
      return
    }
    // 刷新时间如果大于阈值，跳过并等待下一轮刷新
    if ((auth.value.expiresTime! - Date.now()) > (REFRESH_INTERVAL + RESTTIME_PRECISION))
      return
    const res = await Oauth.oauth.refresh({
      grant_type: 'refresh_token',
      refresh_token: auth.value.refreshToken,
    }).catch(() => null)
    // 如果此轮刷新失败，跳过并等待下一轮刷新
    if (!res)
      return
    logger.info('token 已刷新')
    setAuth(res)
  }

  // 自动刷新 token
  const {
    isActive: isAutoRefreshActive,
    pause: pauseRefreshToken,
    resume: resumeRefreshToken,
  } = useTimeoutPoll(() => refreshToken(() => {
    pauseRefreshToken()
  }), REFRESH_INTERVAL)

  // ==================== 角色信息 ====================
  const roleList = shallowRef<API.SysRoleVo[]>([])

  const roleMap = computed(() => roleList.value.reduce((map, role) => {
    return map.set(role.id!, role)
  }, new Map<number, API.SysRoleVo>()))

  // ==================== 用户信息 ====================
  const { data: info, loading: isInfoLoading, refresh: refreshUserInfo } = useFetchHook({
    shallow: true,
    initialValue: null,
    onRequest: async (userId?: number) => {
      if (!userId)
        return null

      if (!roleList.value.length) {
        const { data: newRoleList = [] } = await Api.role.listRole()
        roleList.value = newRoleList
      }

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

  const login = async (form: API.SysTokenVO) => {
    const authData = await Oauth.oauth.token(form)
    setAuth(authData)
    return authData
  }

  const beforeLogout = createEventHook<void>()

  const logout = () => {
    beforeLogout.trigger()
    clearAuth()
  }

  const onBeforeLogout = (fn: () => void) => {
    tryOnMounted(() => {
      beforeLogout.on(fn)
    })
    tryOnUnmounted(() => {
      beforeLogout.off(fn)
    })
  }

  const init = async () => {
    if (!auth.value.refreshToken)
      return
    await refreshToken()
    resumeRefreshToken()
    watch(() => auth.value.refreshToken, (refreshToken) => {
      if (!refreshToken) {
        pauseRefreshToken()
        logger.info('token 刷新已暂停')
        return
      }
      logger.info('token 刷新已启用')
      resumeRefreshToken()
    })
    watch(() => auth.value.userId, refreshUserInfo, { immediate: true })
  }

  return {
    // states
    auth,
    info,
    isLogin,
    isInfoLoading,
    isAutoRefreshActive,

    // actions
    setAuth,
    clearAuth,
    validateToken,
    refreshToken,
    refreshUserInfo,
    login,
    logout,
    onBeforeLogout,
    init,
  }
})
