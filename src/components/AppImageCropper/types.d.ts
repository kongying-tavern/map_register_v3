export interface AppImageCropperProps {
  /**
   * 图源
   * @todo 后续添加支持更多类型
   * @default ''
   */
  image?: string

  /** 图片放大上限，小于自适应最小缩放值时无效 @default 1 */
  maxZoom?: number

  /** 图片缩小上限，小于自适应最小缩放值时无效 @default 0 */
  minZoom?: number

  /** 裁切尺寸与视口的缩放比 @default 1 */
  cropRatio?: number

  /** 在图像状态改变后自动裁切一次 @default false */
  autoCrop?: boolean

  /** 自动裁切防抖，小于 200 无效 @default 200 */
  autoCropDebounce?: number

  /** 是否在图像加载完毕后自动裁切 */
  autoCropOnImageLoaded?: boolean
}
