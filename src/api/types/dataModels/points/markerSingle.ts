import type { MarkerItemLink } from '.'

/** 不含额外信息的点位模型 */
export interface MarkerSingle {
  /**
   * 点位说明
   */
  content?: string
  /**
   * 显隐方法
   */
  hiddenFlag?: number
  /**
   * 点位ID
   */
  id?: number
  /**
   * 点位物品ID列表
   */
  itemList?: MarkerItemLink[]
  /**
   * 点位初始标记者
   */
  markerCreatorId?: number
  /**
   * 点位标题
   */
  markerTitle?: string
  /**
   * 原有点位ID
   */
  original_marker_id?: number
  /**
   * 点位图片
   */
  picture?: string
  /**
   * 点位图片上传者
   */
  pictureCreatorId?: number
  /**
   * 点位坐标
   */
  position?: string
  /**
   * 刷新时间
   */
  refreshTime?: number
  /**
   * 点位视频
   */
  videoPath?: string
}
