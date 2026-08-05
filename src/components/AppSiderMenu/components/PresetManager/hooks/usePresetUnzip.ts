import type {
  FilterConditions,
  FilterConditionsAdvanced,
  FilterConditionsBasic,
} from '../types'
import type { MBFItem } from '@/stores/types'
import { decode } from 'base32768'
import { isNil } from 'lodash'
import { storeToRefs } from 'pinia'
import { useAreaStore, useItemTypeStore } from '@/stores'
import { ByteReader } from '@/utils/ByteAccessor'
import {
  getBinaryFilterType,
  isValidBinaryHead,
} from '../utils'

interface PresetUnzipContext {
  areaIdMap: Map<number, API.AreaVo>
  itemTypeIdMap: Map<number, API.ItemTypeVo>
}

/** 将分享码解压为二进制与原始数据（依赖 store 数据） */
export function usePresetUnzip(code: MaybeRef<string | null | undefined>) {
  const { areaIdMap } = storeToRefs(useAreaStore())
  const { itemTypeIdMap } = storeToRefs(useItemTypeStore())

  const binary = computed(() => {
    const value = unref(code)
    return isNil(value) ? new Uint8Array() : decode(value)
  })
  const conditions = computed(() => {
    return unzip(binary.value, {
      areaIdMap: areaIdMap.value,
      itemTypeIdMap: itemTypeIdMap.value,
    })
  })

  return {
    binary,
    conditions,
  }
}

// ==================== 解压 ====================

function unzipBasic(
  reader: ByteReader,
  context: PresetUnzipContext,
): FilterConditionsBasic {
  const { areaIdMap, itemTypeIdMap } = context
  const result = new Map<string, MBFItem>()

  while (reader.remaining > 0) {
    const areaId = Number(reader.readUint32LE())
    const typeId = Number(reader.readUint32LE())
    const itemCount = Number(reader.readUint8())

    const items: number[] = []
    for (let i = 0; i < itemCount; i++)
      items.push(Number(reader.readUint32LE()))

    const area = areaIdMap.get(areaId)
    const type = itemTypeIdMap.get(typeId)
    if (!area || !type)
      continue

    result.set(`${area.code}-${typeId}`, { area, type, items })
  }

  return result
}

function unzipAdvanced(
  _reader: ByteReader,
  _context: PresetUnzipContext,
): FilterConditionsAdvanced {
  // TODO: 读取高级预设二进制
  return []
}

function unzip(
  data: Uint8Array,
  context: PresetUnzipContext,
): FilterConditions {
  if (data.length === 0)
    return new Map()

  const reader = new ByteReader(data)
  const head = Number(reader.readUint8())

  if (!isValidBinaryHead(head))
    throw new Error('分享码头部无效')

  switch (getBinaryFilterType(head)) {
    case 'basic':
      return unzipBasic(reader, context)
    case 'advanced':
      return unzipAdvanced(reader, context)
    default:
      throw new Error('无效分享码：不支持的预设类型')
  }
}
