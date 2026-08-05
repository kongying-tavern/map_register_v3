import type {
  FilterConditions,
  FilterConditionsAdvanced,
  FilterConditionsBasic,
} from '../types'
import { encode } from 'base32768'
import { isNil } from 'lodash'
import { ByteWriter } from '@/utils/ByteAccessor'
import { isAdvancedFilter, toConditionsBaseMap } from '../utils'

/** 将原始数据压缩为二进制与分享码（依赖 store 数据） */
export function usePresetZip(conditions: MaybeRef<FilterConditions | null | undefined>) {
  const binary = computed(() => zip(unref(conditions)))
  const shareCode = computed(() => encode(binary.value))

  return {
    binary,
    shareCode,
  }
}

// ==================== 压缩（TODO：依赖 store 数据） ====================

function zipBasic(conditions: FilterConditionsBasic): Uint8Array {
  const writer = new ByteWriter()

  // 第一个字节：先清零，再设置位标记
  // 前两位 0b01 为合规标记（说明是合法压缩数据），后四位 0b0001 为 basic 过滤类型标记
  // => 二进制 01000001 = 0x41
  writer
    .setBit(0b0, 1, 8)
    .setBit(0b01, 1, 2)
    .setBit(0b0001, 5, 8)
    .moveBy(1)

  // 无条目数，读取时遍历到字节尾部即可
  // 每条：areaId(u32) + typeId(u32) + item 长度(u8) + 循环 itemId(u32)
  const entries = toConditionsBaseMap(conditions)

  for (const condition of entries.values()) {
    writer.writeUint32LE(condition.area.id ?? 0, 'clamp')
    writer.writeUint32LE(condition.type.id ?? 0, 'clamp')
    writer.writeUint8(condition.items.length)
    for (const itemId of condition.items)
      writer.writeUint32LE(itemId, 'clamp')
  }

  return writer.toUint8Array()
}

function zipAdvanced(_conditions: FilterConditionsAdvanced): Uint8Array {
  // TODO
  return new Uint8Array()
}

function zip(conditions: FilterConditions | null | undefined): Uint8Array {
  if (isNil(conditions))
    return new Uint8Array()
  return isAdvancedFilter(conditions)
    ? zipAdvanced(conditions)
    : zipBasic(conditions)
}
