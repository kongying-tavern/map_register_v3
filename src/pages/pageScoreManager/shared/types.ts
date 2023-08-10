export interface ScoreVo {
  data: Data
  scope: string
  span: string
  user: API.SysUserVo
  userId: number
}

export interface Data {
  /**
   * 字数
   */
  chars: Chars
  fields: Fields
}

/**
* 字数
*/
export interface Chars {
  /**
   * 内容
   */
  content: number
  /**
   * 标题
   */
  markerTitle: number
}

export interface Fields {
  /**
   * 内容
   */
  content?: number
  createTime?: number
  creatorId?: number
  extra?: number
  /**
   * 可见状态
   */
  hiddenFlag?: number
  markerStamp?: number
  /**
   * 标题
   */
  markerTitle?: number
  /**
   * 图片
   */
  picture?: number
  /**
   * 位置
   */
  position?: number
  /**
   * 刷新时间
   */
  refreshTime?: number
  updaterId?: number
  updateTime?: number
}
