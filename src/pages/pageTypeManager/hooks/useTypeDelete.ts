import type { TypeManager } from '../config'
import { useFetchHook } from '@/hooks'

export const useTypeDelete = <T = unknown>(manager: Ref<TypeManager<T>>) => {
  const { ...rest } = useFetchHook({
    onRequest: async (maybeTypes: T) => {
      const mission = Array.isArray(maybeTypes)
        ? Promise.allSettled(maybeTypes.map(singleType => manager.value.delete(singleType as T)))
        : manager.value.delete(maybeTypes as T)
      await mission
    },
  })

  return { ...rest }
}
