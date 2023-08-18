export interface IconRenderConfig {
  debug?: boolean
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
  /** 点位被设置为不显眼时的透明度 */
  inconspicuousOpacity: number
  /** 点位的定位状态 */
  positions: {
    position: string
    icon?: { url: string; size: [number, number]; pos: [number, number] }
  }[]
  /** 点位根据状态不同显示不同颜色的边框 */
  states: {
    state: string
    color: string
  }[]
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
  // debug: true,
  size: {
    w: 42,
    h: 50,
  },
  affix: {
    x: 21,
    y: 45,
  },
  inconspicuousOpacity: 0.2,
  positions: [
    { position: 'aboveground' },
    { position: 'underground', icon: { url: '/icons/LayerUndergroundMark.png', size: [20, 20], pos: [22, 0] } },
  ],
  states: [
    { state: 'default', color: '#FFF' },
    { state: 'marked', color: '#00FFFD' },
    { state: 'moving', color: '#FFFF00' },
  ],
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

/**
* 总计需要渲染的状态，
* 并按照以 `positions` 为分组的顺序渲染
*/
export const ICON_MAPPING_STATES = ICON.positions.reduce((seed, { position }) => {
  ICON.states.forEach(({ state }) => seed.push(`_${position}_${state}`))
  return seed
}, [] as string[])
