import { useFetchHook } from '@/hooks'

export interface ManagerOptions<C, T> {
  /** 是否启用定时更新 */
  timeoutPull?: {
    /** 更新间隔, 单位毫秒 */
    time: number
    /** 当条件满足时会开始定时更新，条件不满足时会暂停定时更新 */
    condition: () => boolean
  }
  /** 自定义上下文 */
  context: C
  /** 初始化上下文 */
  init?: (context: C, full: (context: C) => Promise<T | void>) => Promise<T | void>
  /** 差异更新数据 */
  diff?: (context: C) => Promise<T | void>
  /** 全量更新数据 */
  full: (context: C) => Promise<T | void>
  /** 写入数据 */
  commit: (data: T | void, context: C) => Promise<void>
  /**
   * 用于同步本地状态
   * @param data 要同步的数据，通常是 diff 或 full 返回的数据
   * @param context 上下文
   * @param isInit 是否为 init 阶段（true: 完全替换; false: 增量更新）
   */
  syncState?: (data: T | void, context: C, isInit: boolean) => void
}

export interface ManagerUpdateOptions {
  isFull?: boolean
}

export const useManager = <C, T>(options: ManagerOptions<C, T>) => {
  const {
    timeoutPull,
    context,
    init,
    diff,
    full,
    commit,
    syncState,
  } = options

  const isInit = ref(false)
  const error = ref('')

  const initPromise = init?.(context, full)
    .then((initData) => {
      if (initData === undefined || !syncState)
        return
      syncState(initData, context, true)
    })
    .finally(() => {
      isInit.value = true
    })

  const { refresh: update, loading, onError, ...rest } = useFetchHook({
    onRequest: async (options: ManagerUpdateOptions = {}) => {
      if (!isInit.value)
        return
      error.value = ''
      await initPromise
      const { isFull = false } = options
      const data = await (isFull ? full : diff ?? full)(context)
      syncState?.(data, context, false)
      await commit(data, context)
    },
  })

  onError((err) => {
    error.value = err.message
  })

  /** 下一次更新的时间 */
  const nextUpdateTime = ref<number>(Date.now())

  const pollTime = ref(0)

  const { isActive, pause, resume } = useTimeoutPoll(async () => {
    if (!loading.value)
      await update()
    nextUpdateTime.value = Date.now() + pollTime.value
  }, pollTime, {
    immediate: false,
  })

  if (timeoutPull) {
    const { condition, time } = timeoutPull
    pollTime.value = time
    watch(() => condition(), (isTrue) => {
      if (!isTrue) {
        pause()
        return
      }
      resume()
    }, { immediate: true })
  }

  return {
    error,
    context,
    update,
    onError,
    loading,
    nextUpdateTime,
    isActive,
    ...rest,
  }
}
