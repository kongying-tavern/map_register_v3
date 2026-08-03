import type {
  FilterConditions,
  FilterConditionsAdvanced,
  FilterConditionsBasic,
} from '../types'
import { encode } from 'base32768'
import { isAdvancedFilter } from '../utils'

/** 将原始数据压缩为二进制与分享码（依赖 store 数据） */
export function usePresetsZip(conditions: MaybeRef<FilterConditions>) {
  const binary = computed(() => zip(unref(conditions)))
  const shareCode = computed(() => encode(binary.value))

  return {
    binary,
    shareCode,
  }
}

// ==================== 压缩（TODO：依赖 store 数据） ====================

function zipBasic(_conditions: FilterConditionsBasic): Uint8Array {
  // TODO
  return new Uint8Array()
}

function zipAdvanced(_conditions: FilterConditionsAdvanced): Uint8Array {
  // TODO
  return new Uint8Array()
}

function zip(conditions: FilterConditions): Uint8Array {
  // TODO: embed type marker + encode conditions
  return isAdvancedFilter(conditions)
    ? zipAdvanced(conditions)
    : zipBasic(conditions)
}
