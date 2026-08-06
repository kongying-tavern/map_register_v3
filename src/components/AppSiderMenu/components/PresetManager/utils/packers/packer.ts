import type { ValuePacker } from './types'
import { MAFModelId } from '@/shared'
import {
  customIdRangePacker,
  customLinkActionPacker,
  customUndergroundLayerPacker,
  msgpackPacker,
} from './handlers'

/** 自定义打包器映射：key 为 MAFModelId，缺省时使用默认 msgpack 打包器 */
export const valuePackers: Partial<Record<MAFModelId, ValuePacker>> = {
  [MAFModelId.ID_RANGE]: customIdRangePacker,
  [MAFModelId.UNDERGROUND_LAYER]: customUndergroundLayerPacker,
  [MAFModelId.LINKAGE_ACTION]: customLinkActionPacker,
}

/** 获取指定过滤条件的打包器 */
export const getValuePacker = (modelId: MAFModelId): ValuePacker => {
  return valuePackers[modelId] ?? msgpackPacker
}
