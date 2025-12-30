import type * as API2 from '@/api/alova/globals'

/** 关联项配置 */
export interface ModifyLinkOptions {
  /** `${linkId}` */
  id: string
  /** 原始数据 */
  raw: API2.MarkerLinkageVo
  /** 是否反向 */
  isReverse: boolean
  /** 是否为删除项 */
  isDelete: boolean
  /** 是否来自合并项 */
  isMerge: boolean
  /** 是否为临时组（仅用于 focus 点位） */
  isTemp?: boolean
}
