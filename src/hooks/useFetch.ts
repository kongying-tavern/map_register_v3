import type { Ref } from 'vue'
import { messageFrom } from '@/utils'

export interface FetchHookOptions<T = any> {
  loading?: Ref<boolean>
  immediate?: boolean
  onRequest?: () => Promise<T>
  onSuccess?: (res: T) => void
  onError?: (err: Error) => void
}

export const useFetchHook = <T>(options: FetchHookOptions<T> = {}) => {
  const { immediate, loading = ref(false), onRequest, onSuccess, onError } = options

  const onSuccessHook = createEventHook<T>()
  const onErrorHook = createEventHook<Error>()

  const refresh = async () => {
    try {
      loading.value = true
      if (onRequest) {
        const res = await onRequest()
        onSuccess?.(res)
        onSuccessHook.trigger(res)
      }
    }
    catch (err) {
      onError?.(err instanceof Error ? err : new Error(messageFrom(err)))
      onErrorHook.trigger(err instanceof Error ? err : new Error(messageFrom(err)))
    }
    finally {
      loading.value = false
    }
  }

  immediate && onMounted(refresh)

  return { loading, refresh, onSuccess: onSuccessHook.on, onError: onErrorHook.on }
}
