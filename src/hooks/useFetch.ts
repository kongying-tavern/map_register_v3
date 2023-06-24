import type { Ref } from 'vue'
import { messageFrom } from '@/utils'

interface BasicResponseBody extends Omit<API.RBoolean, 'data'> {
}

const isBasicResponse = (v: unknown): v is BasicResponseBody => {
  if (typeof v !== 'object' || v === null)
    return false
  return true
}

export interface FetchHookOptions<T> {
  loading?: Ref<boolean>
  immediate?: boolean
  onRequest?: () => Promise<T>
}

export const useFetchHook = <T>(options: FetchHookOptions<T> = {}) => {
  const { immediate, loading = ref(false), onRequest } = options

  const onSuccessHook = createEventHook<T>()
  const onErrorHook = createEventHook<Error>()
  const onFinishHook = createEventHook<void>()

  const refresh = async () => {
    try {
      loading.value = true
      if (onRequest) {
        const res = await onRequest()
        if (isBasicResponse(res) && res.error)
          throw new Error(`error in server: ${res.message}`)
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

  immediate && onMounted(refresh)

  return { loading, refresh, onSuccess: onSuccessHook.on, onError: onErrorHook.on, onFinish: onFinishHook.on }
}
