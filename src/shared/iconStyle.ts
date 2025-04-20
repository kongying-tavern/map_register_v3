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

export interface IconStyleMeta {
  name: string
  description: string
}

export const ICON_STYLE_NAME_MAP = new Map<number, string>([
  [IconStyle.DEFAULT, '默认图标'],
  [IconStyle.NO_BORDER, '无边框'],
  [IconStyle.PUPIL, '类神瞳'],
  [IconStyle.NO_TICK, '类神瞳无对钩'],
])

/**
 * iconStyle 用于控制图标在客户端上的显示模式
 */
export const ICON_STYLE_META_MAP = new Map<IconStyle, IconStyleMeta>([
  [IconStyle.DEFAULT, {
    name: '默认图标',
    description: '有边框 + 背景',
  }],
  [IconStyle.NO_BORDER, {
    name: '无边框',
    description: '无边框 + 无背景',
  }],
  [IconStyle.PUPIL, {
    name: '类神瞳',
    description: '无边框 + 无背景 + 物品 icon 与点位 icon 不一致 + 标记后有绿色对钩',
  }],
  [IconStyle.NO_TICK, {
    name: '类神瞳无对钩',
    description: '无边框 + 无背景 + 物品 icon 与点位 icon 不一致 + 标记后无绿色对钩',
  }],
])
