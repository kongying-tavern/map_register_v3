/** 点位额外字段 */
export interface MarkerExtra {
  /**
   * 关联其他点位Flag，1为关联了其他点位，需要做关联工作
   */
  isRelated?: string
  /**
   * 额外特殊字段具体内容，json格式，详情参见“点位额外字段文档”
   */
  markerExtraContent?: string
  /**
   * 点位ID
   */
  markerId?: number
  /**
   * 父点位ID，根据点位类型，此字段可能不存在或者为空
   */
  parentId?: number
}
