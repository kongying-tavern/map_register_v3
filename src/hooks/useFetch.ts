import type { ShallowRef } from 'vue'
import { messageFrom } from '@/utils'

interface BasicResponseBody extends Omit<API.RBoolean, 'data'> {
}

const isBasicResponse = (v: unknown): v is BasicResponseBody => {
  if (typeof v !== 'object' || v === null)
    return false
  return true
}

export interface FetchHookOptions<T, A extends unknown[] = []> {
  /** loading 值，可以使用外部响应式值 */
  loading?: Ref<boolean>
  /** 是否在函数执行后立即发起请求 */
  immediate?: boolean
  /** 当依赖响应式 data 时最好提供此值 */
  initialValue?: T
  /** `onRequest` 提供了返回值时可以使用响应式 data，该选项会提供一个浅层响应式值 */
  shallow?: boolean
  /** 检测 data 是否发生变化，如果没变则不触发 onSuccess 回调 */
  diff?: (oldData: T, newData: T) => boolean
  /** 发起网络请求或其他异步操作，错误已被捕获，可以直接在过程中抛出 */
  onRequest?: (...args: A) => Promise<T>
}

export const useFetchHook = <T, A extends unknown[] = []>(options: FetchHookOptions<T, A>) => {
  const {
    immediate,
    loading = ref(false),
    initialValue,
    shallow,
    diff,
    onRequest,
  } = options

  const onSuccessHook = createEventHook<T>()
  const onErrorHook = createEventHook<Error>()
  const onFinishHook = createEventHook<void>()

  const data = shallow
    ? shallowRef(initialValue) as ShallowRef<T>
    : ref(initialValue) as Ref<T>

  const abortController = shallowRef<AbortController>()

  const refresh = async (...args: A) => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = undefined
    }

    const abort = new AbortController()
    abortController.value = abort

    try {
      loading.value = true
      if (onRequest) {
        const res = await onRequest(...args)
        if (abort.signal.aborted)
          return
        if (isBasicResponse(res) && res.error)
          throw new Error(`error in server: ${res.message}`)
        if (diff && diff(data.value, res))
          return data.value
        data.value = res as T
        loading.value = false
        onSuccessHook.trigger(res)
        return res
      }
    }
    catch (err) {
      loading.value = false
      onErrorHook.trigger(err instanceof Error ? err : new Error(messageFrom(err)))
    }
    finally {
      loading.value = false
      onFinishHook.trigger()
      abortController.value = undefined
    }
  }

  immediate && tryOnMounted(refresh)

  return { data, loading, refresh, onSuccess: onSuccessHook.on, onError: onErrorHook.on, onFinish: onFinishHook.on }
}
Reflect.set(globalThis, 'useFetchHook', useFetchHook)
