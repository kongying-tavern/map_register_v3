/** IconLayer 渲染图标的配置 */

/** 图标的半透边框的尺寸需要注意，图标的实际定位坐标会被设置于实心钉子处而不是半透边框钉子处 */
export const BORDER_WIDTH = 2

/** 图标的半透边框的颜色 */
export const BORDER_COLOR = '#40404080'

/** 图标背景色 */
export const BACKGROUND_COLOR = '#FFF'

/** 图标 hover 时的背景色 */
export const BACKGROUND_HOVER_COLOR = '#DDD'

/** 图标 active 时的背景色 */
export const BACKGROUND_ACTIVE_COLOR = '#AAA'

/** 图标 focus 时的背景色 */
export const BACKGROUND_FOCUS_COLOR = 'skyblue'

/** 图标被标记时的透明度 (0 ~ 1) */
export const ICON_MARKERDE_ALPHA = 0.2

/** 图标宽度 */
export const ICON_WIDTH = 40
/** 图标高度 */
export const ICON_HEIGHT = ICON_WIDTH * 1.25

/** 图标内圆与外圆的间距 */
export const INNER_GAP = 4

/** 图标实际占用尺寸 */
export const ICON_RECT = [
  ICON_WIDTH + 2 * BORDER_WIDTH,
  ICON_HEIGHT + 2 * BORDER_WIDTH,
] as [number, number]
