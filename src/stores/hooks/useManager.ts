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
  /** 可用于初始化上下文, 在 update 时会且仅会被调用一次 */
  init?: (context: C) => Promise<void>
  /** 差异更新数据 */
  diff?: (context: C) => Promise<T>
  /** 全量更新数据 */
  full: (context: C) => Promise<T>
  /** 写入数据 */
  commit: (data: T, context: C) => Promise<void>
}

export interface ManagerUpdateOptions {
  isFull?: boolean
}

export const useManager = <C, T>(options: ManagerOptions<C, T>) => {
  const { timeoutPull, context, init, diff, full, commit } = options

  const isInit = ref(false)

  const error = ref('')

  const { refresh: update, loading, onError, ...rest } = useFetchHook({
    onRequest: async (options: ManagerUpdateOptions = {}) => {
      error.value = ''
      if (!isInit.value && init) {
        await init(context).finally(() => {
          isInit.value = true
        })
      }
      const { isFull = false } = options
      const data = await (isFull ? full : diff ?? full)(context)
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
