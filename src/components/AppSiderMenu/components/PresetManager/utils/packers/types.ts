import type { MAFValue } from '@/stores/types'

/** packer 解码上下文（由解压前置构建） */
export interface PresetPackContext {
  areaIdMap: Map<number, API.AreaVo>
  itemTypeIdMap: Map<number, API.ItemTypeVo>
  /** 分层层级 code → 24 位 MD5 哈希 */
  undergroundCodeToHashMap: ReadonlyMap<string, bigint>
  /** 24 位 MD5 哈希 → 分层层级 code */
  undergroundHashToCodeMap: ReadonlyMap<bigint, string>
}

export interface ValuePacker {
  encode: (value: MAFValue) => Uint8Array
  decode: (bytes: Uint8Array, context: PresetPackContext) => MAFValue
}
