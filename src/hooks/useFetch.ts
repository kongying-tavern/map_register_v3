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
  loading?: ShallowRef<boolean>
  immediate?: boolean
  initialValue?: T
  shallow?: boolean
  diff?: (oldData: T, newData: T) => boolean
  onRequest?: (...args: A) => Promise<T>
}

export const useFetchHook = <T, A extends unknown[] = []>(options: FetchHookOptions<T, A>) => {
  const {
    immediate,
    loading = shallowRef(false),
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

  const timestamp = shallowRef(Date.now())

  const refresh = async (...args: A) => {
    const current = Date.now()
    timestamp.value = current
    try {
      loading.value = true
      if (onRequest) {
        const res = await onRequest(...args)
        if (isBasicResponse(res) && res.error)
          throw new Error(`error in server: ${res.message}`)
        if (current < timestamp.value)
          return
        if (diff && diff(data.value, res))
          return
        data.value = res as T
        onSuccessHook.trigger(res)
      }
    }
    catch (err) {
      onErrorHook.trigger(err instanceof Error ? err : new Error(messageFrom(err)))
    }
    finally {
      loading.value = false
      onFinishHook.trigger()
    }
  }

  immediate && tryOnMounted(refresh)

  return { data, loading, refresh, onSuccess: onSuccessHook.on, onError: onErrorHook.on, onFinish: onFinishHook.on }
}
