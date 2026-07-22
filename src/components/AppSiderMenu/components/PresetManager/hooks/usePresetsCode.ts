import type { FilterConditions } from '../types'
import { PresetsZipper } from '../utils'

export function usePresetsCode(conditions: MaybeRef<FilterConditions>) {
  const zipper = new PresetsZipper()

  const binary = computed(() => zipper.zip(unref(conditions)))
  const shareCode = computed(() => zipper.zipToCode(unref(conditions)))

  return {
    binary,
    shareCode,
  }
}
