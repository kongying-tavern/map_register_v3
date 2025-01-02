import { defineStore } from 'pinia'
import { catchError, from, of, retry } from 'rxjs'
import { camelCase } from 'lodash'
import { userHook } from './hooks'
import { Logger } from '@/utils'
import Oauth from '@/api/oauth'
import { USERAUTH_KEY } from '@/shared'
import { router } from '@/router'

export interface LocalAuth {
  refreshToken: string
  userId: number
  expiresIn: number
  expiresTime: number
  accessToken: string
  tokenType: string
}

const logger = new Logger('鉴权')

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

export const useUserAuthStore = defineStore('global-user-auth', () => {
  const auth = useLocalStorage<Partial<LocalAuth>>(USERAUTH_KEY, {})

  const beforeLogout = createEventHook<void>()

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
    const { accessToken, expiresTime = 0, userId } = auth.value
    if (!accessToken || !userId)
      return false
    return expiresTime > Date.now()
  }

  const isTokenValid = computed(() => {
    if (!auth.value.accessToken)
      return false
    const { expiresTime = 0 } = auth.value
    return expiresTime > Date.now()
  })

  const refreshAuth = () => new Promise<void>((resolve, reject) => {
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
      resolve()
      subscription.unsubscribe()
    })
  })

  /** 刷新计时器 */
  const intervalRefreshTimer = ref<number>()

  const stopAutoRefresh = () => {
    window.clearTimeout(intervalRefreshTimer.value)
    intervalRefreshTimer.value = undefined
  }

  /** 自动刷新 token */
  const startAutoRefresh = async () => {
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
        if (!auth.value.refreshToken)
          return
        await refreshAuth()
        startAutoRefresh()
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
      auth.value = {}
      router.push('/login')
      logger.error(err)
    }
  }

  const clearAuth = () => {
    stopAutoRefresh()
    // FIXME 下面这行会导致 vue runtime 调用 window.close 使得页面关闭（有时候会被阻止），暂时不知道为什么。
    // 目前已在 index.html 中将 window.close 改为空函数来缓解此问题。
    auth.value = {}
    userHook.applyCallbacks('onAuthChange')
  }

  const login = async (form: API.SysTokenVO) => {
    const authData = await Oauth.oauth.token(form)
    setAuth(authData)
    return authData
  }

  const logout = () => {
    beforeLogout.trigger()
    clearAuth()
    router.push('/login')
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
    if (auth.value.refreshToken)
      await refreshAuth()
    if (!validateToken()) {
      logout()
      return
    }
    await startAutoRefresh()
  }

  return {
    // states
    auth,

    // getters
    isTokenValid,

    // actions
    setAuth,
    clearAuth,
    validateToken,
    refreshAuth,
    stopAutoRefresh,
    startAutoRefresh,
    login,
    logout,
    onBeforeLogout,
    init,
  }
})
