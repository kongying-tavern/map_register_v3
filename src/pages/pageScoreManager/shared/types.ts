import type { SysUserSmallVo } from '@/api/alova/globals'

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
  user?: SysUserSmallVo
  userId?: number
}

export interface FormatedScore extends ScoreVo {
  scope?: string
  span?: string
  username?: string
  nickname?: string
  qq?: string
  phone?: string
  logo?: string
  remark?: string
  userId?: number
  totalChars?: number
  totalCount?: number
}
