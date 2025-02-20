export interface ScoreVo {
  data?: {
    /** 字数 */
    chars?: {
      content?: number
      markerTitle?: number
    }
    /** 次数 */
    fields?: {
      content?: number
      createTime?: number
      creatorId?: number
      extra?: number
      hiddenFlag?: number
      markerStamp?: number
      markerTitle?: number
      picture?: number
      position?: number
      refreshTime?: number
      updaterId?: number
      updateTime?: number
    }
  }
  scope?: string
  span?: string
  user?: API.SysUserSmallVo
  userId?: number
}
