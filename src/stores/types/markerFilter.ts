// ==================== 基础筛选模型 ====================
interface PresetType {
  basic: Record<string, MBFItem>
  advanced: MAFGroup[]
}

export type FilterType = keyof PresetType

interface ExtractFilter<K extends FilterType> {
  name: string
  type: K
  conditions: PresetType[K]
}

export type FilterPreset = ExtractFilter<'basic'> | ExtractFilter<'advanced'>

export interface MBFItem {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: number[]
}

// ==================== 高级筛选模型 ====================
export interface MAFGroup {
  // true 为 AND，false 为 OR
  operator: boolean
  opposite: boolean
  children: MAFItem[]
}

export interface MAFItem {
  id: number
  // true 为 AND，false 为 OR
  operator: boolean
  opposite: boolean
  value: MAFValue
}

export interface MAFConfig {
  readonly id: number
  readonly name: string
  readonly option: MAFOption
  readonly defaultVal: MAFValue
  prepare(val: MAFValue): MAFMeta
  semantic(val: MAFValue, opt: MAFOption, meta: MAFMeta, opposite: boolean): string
  filter(val: MAFValue, opt: MAFOption, meta: MAFMeta, marker: API.MarkerVo): boolean
}

// ==================== 数据模型 ====================
export interface MAFValue {}

export interface MAFValueDummy extends MAFValue {
}

export interface MAFValueInput extends MAFValue {
  v: string
}

export interface MAFValueSwitch extends MAFValue {
  b: boolean
}

// ==================== 配置模型 ====================
export interface MAFOption {}

export interface MAFOptionDummy extends MAFOption {
}

export interface MAFOptionInput extends MAFOption {
  placeholder?: string
}

export interface MAFOptionSwitch extends MAFOption {
  textInactive?: string
  textActive?: string
}

// ==================== 预处理数据模型 ====================
export interface MAFMeta {}

export interface MAFMetaDummy extends MAFMeta {
}

export interface MAFMetaIdRange extends MAFMeta {
  idSet: Set<number>
}

export interface MAFMetaContentRegex extends MAFMeta {
  re?: RegExp
}
