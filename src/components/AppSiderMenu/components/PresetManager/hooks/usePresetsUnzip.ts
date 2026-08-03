import type {
  FilterConditions,
  FilterConditionsAdvanced,
  FilterConditionsBasic,
} from '../types'
import { decode } from 'base32768'

/** 将分享码解压为二进制与原始数据（依赖 store 数据） */
export function usePresetsUnzip(code: MaybeRef<string>) {
  const binary = computed(() => decode(unref(code)))
  const conditions = computed(() => unzip(binary.value))

  return {
    binary,
    conditions,
  }
}

// ==================== 解压（TODO：依赖 store 数据） ====================

function unzipBasic(_data: Uint8Array): FilterConditionsBasic {
  // TODO
  return new Map()
}

function unzipAdvanced(_data: Uint8Array): FilterConditionsAdvanced {
  // TODO
  return []
}

function unzip(data: Uint8Array): FilterConditions {
  // TODO: read type marker from binary then dispatch
  return data.length === 0
    ? unzipBasic(data)
    : unzipAdvanced(data)
}
