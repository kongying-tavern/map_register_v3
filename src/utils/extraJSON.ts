export interface MarkerExtra {
  /** 2.8 海岛单独字段 */
  '2_8_island'?: {
    island_name?: string
    island_state?: string[]
  }

  /** 地下区域 */
  underground?: {
    /** 是否是地下点位 */
    is_underground?: boolean
    /**
     * 数据模型 ID
     * 1. 通用地下: `basic`
     * 2. 须弥·大赤沙海: `sumeru2`
     * 3. 须弥·千壑沙地: `sumeru3`
     */
    model_id?: string
    /** 区域名字（代号） */
    region_name?: string
    /** 区域层级 */
    region_levels?: string[]
  }

  /** 洞口关联 - 关联洞口 ID 数组 */
  caves?: number[]

  /** @todo 点位关联(宝箱，编写中) */
}

/** 用于解析点位 extra 字段信息的专用工具类，忽略无效的其余字段 */
export class ExtraJSON {
  // TODO 校验、去除多余字段
  static parse = (valueString: string) => {
    try {
      const rawObj = JSON.parse(valueString)
      return rawObj as MarkerExtra
    }
    catch {
      return {} as MarkerExtra
    }
  }

  // TODO 不输出内容为null的字段
  static stringify = (valueObject: MarkerExtra) => {
    try {
      return JSON.stringify(valueObject)
    }
    catch {
      return '{}'
    }
  }
}
