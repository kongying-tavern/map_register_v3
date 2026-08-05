import type { ValuePacker } from './types'
import { msgpackPacker } from './msgpack'

/** 自定义打包器映射：key 为 MAFModelId，缺省时使用默认 msgpack 打包器 */
export const valuePackers: Partial<Record<number, ValuePacker>> = {}

/** 获取指定过滤条件的打包器 */
export const getValuePacker = (modelId: number): ValuePacker => {
  return valuePackers[modelId] ?? msgpackPacker
}
