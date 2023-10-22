import { defineStore } from 'pinia'
import { catchError, from, of, retry } from 'rxjs'
import { camelCase } from 'lodash'
import { RouterHook, UserHook } from './utils'
import { Logger } from '@/utils'
import Oauth from '@/api/oauth'
import { USERAUTH_KEY } from '@/shared'
import { useUserInfoStore } from '@/stores'

export interface LocalAuth {
  refreshToken: string
  userId: number
  expiresIn: number
  expiresTime: number
  accessToken: string
  tokenType: string
}

const logger = new Logger('[auth]')

/** 刷新的阈值时间 */
const TOKEN_REFRESH_REST_TIME = import.meta.env.VITE_TOKEN_REFRESH_REST_TIME * 1000

/** 计算到期时间 */
const getExpiressTime = (expiressIn: number) => Date.now() + expiressIn * 1000

/** 计算剩余有效时间 */
const getRestTime = (expiressTime: number) => new Date(expiressTime).getTime() - Date.now()

/** 计算剩余有效时间与设定刷新阈值时间的差 */
const differenceTokenTime = (expiressTime: number) => getRestTime(expiressTime) - TOKEN_REFRESH_REST_TIME

const toCamelCaseObject = <T extends Record<string, unknown>>(obj: T): SnakeCaseKeysToCamelCase<T> => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [camelCase(key), value])) as SnakeCaseKeysToCamelCase<T>
}

export const useUserAuthStore = defineStore('user-auth', () => {
  const auth = useLocalStorage<Partial<LocalAuth>>(USERAUTH_KEY, {})

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

  const validateToken = () => {
    const { expiresTime = 0 } = auth.value
    return expiresTime > Date.now()
  }

  const refreshAuth = () => new Promise<API.SysToken>((resolve, reject) => {
    const { refreshToken } = auth.value
    if (!refreshToken)
      return reject(new Error('鉴权信息为空'))
    const request = Oauth.oauth.refresh({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
    const subscription = from(request).pipe(
      retry({
        count: 3,
        delay: 3000,
      }),
      catchError(err => of(err instanceof Error ? err : new Error(`${err}`))),
    ).subscribe((result) => {
      if (result instanceof Error)
        return reject(result)
      setAuth(result)
      resolve(result)
      subscription.unsubscribe()
      UserHook.applyCallbacks('onAuthChange')
    })
  })

  /** 刷新计时器 */
  const intervalRefreshTimer = ref<number>()

  const stopAutoRefresh = () => {
    window.clearTimeout(intervalRefreshTimer.value)
    intervalRefreshTimer.value = undefined
  }

  /** 确认自动刷新 token 任务存在 */
  const ensureTokenRefreshMission = async () => {
    const userInfoStore = useUserInfoStore()
    try {
      const { expiresTime = 0 } = auth.value
      const refreshInterval = differenceTokenTime(expiresTime)
      const seconds = (refreshInterval / 1000).toFixed(0)

      if (intervalRefreshTimer.value !== undefined) {
        logger.info(`已存在定时刷新任务，将于 ${seconds} 秒后刷新`)
        return
      }

      const commitRefresh = async () => {
        stopAutoRefresh()
        await refreshAuth()
        await userInfoStore.updateUserInfo()
        ensureTokenRefreshMission()
      }

      if (refreshInterval <= 0) {
        await commitRefresh()
        return
      }

      logger.info(`token 将于 ${seconds} 秒后刷新`)
      intervalRefreshTimer.value = window.setTimeout(async () => {
        await commitRefresh()
      }, refreshInterval)
    }
    catch (err) {
      stopAutoRefresh()
      logger.error(err)
    }
  }

  const logout = () => {
    auth.value = {}
    stopAutoRefresh()
  }

  return {
    // states
    auth,

    // actions
    setAuth,
    validateToken,
    refreshAuth,
    ensureTokenRefreshMission,
    logout,
  }
})

RouterHook.onBeforeRouterEnter(useUserAuthStore, async (store) => {
  await store.ensureTokenRefreshMission()
})
