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

  const refresh = async () => {
    try {
      loading.value = true
      if (onRequest) {
        const res = await onRequest()
        onSuccess?.(res)
      }
    }
    catch (err) {
      onError?.(err instanceof Error ? err : new Error(messageFrom(err)))
    }
    finally {
      loading.value = false
    }
  }

  immediate && onMounted(refresh)

  return { loading, refresh }
}
