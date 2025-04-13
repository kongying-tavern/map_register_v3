/** 图标样式类型枚举 */
export enum IconStyle {
  /** 默认 */
  DEFAULT = 0,
  /** 无边框 */
  NO_BORDER = 1,
  /** 类神瞳 */
  PUPIL = 2,
  /** 类神瞳无对钩 */
  NO_TICK = 3,
}

export const ICON_STYLE_NAME_MAP = new Map<number, string>([
  [IconStyle.DEFAULT, '默认图标'],
  [IconStyle.NO_BORDER, '无边框'],
  [IconStyle.PUPIL, '类神瞳'],
  [IconStyle.NO_TICK, '类神瞳无对钩'],
])
