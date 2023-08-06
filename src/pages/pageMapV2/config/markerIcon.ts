export interface IconRenderConfig {
  /** 点位整体图标尺寸设置（需包含底部阴影的尺寸） */
  size: {
    w: number
    h: number
  }
  /** 点位坐标指示点在图标中的位置 */
  affix: {
    x: number
    y: number
  }
  state: {
    /** 点位默认状态颜色 */
    defaultColor: string
    /** 点位被标记时的内边框颜色 */
    markedColor: string
    /** 点位被设置为不显眼时的透明度 */
    inconspicuousOpacity: number
  }
  /** 图标内容区设置 */
  content: {
    radius: number
    fit: 'contain' | 'cover'
  }
  /** 点位底部阴影设置 */
  shadow: {
    color: string
    radiusX: number
    radiusY: number
  }
  /** 点位外边框设置 */
  border: {
    width: number
    color: string
  }
}

/** IconLayer 渲染图标的配置 */
export const ICON: IconRenderConfig = {
  size: {
    w: 42,
    h: 50,
  },
  affix: {
    x: 21,
    y: 45,
  },
  state: {
    defaultColor: '#FFF',
    markedColor: '#00FFFD',
    inconspicuousOpacity: 0.2,
  },
  content: {
    radius: 16,
    fit: 'contain',
  },
  shadow: {
    color: '#33333380',
    radiusX: 10,
    radiusY: 5,
  },
  border: {
    width: 1,
    color: '#33333360',
  },
}
