import type { InjectionKey } from 'vue'

export const MAP_FONTFAMILY = 'map-font-zhcn'

/** 点位的空间状态 */
export const MARKER_POSITION = ['aboveground', 'underground']

/** 点位的交互状态 */
export const MARKER_STATE = ['default', 'marked']

/**
 * 总计需要渲染 `MARKER_POSITION` * `MARKER_STATE` 种状态，
 * 并按照以 `MARKER_POSITION` 为分组的顺序渲染
 */
export const ICON_MAPPING_STATES = MARKER_POSITION.reduce((seed, pos) => {
  MARKER_STATE.forEach(state => seed.push(`_${pos}_${state}`))
  return seed
}, [] as string[])

export const mutuallyExclusiveLayerKey = Symbol('mutually-exclusive-layer') as InjectionKey<Ref<HTMLElement | null>>
export const genshinMapCanvasKey = Symbol('canvas-ref') as InjectionKey<Ref<HTMLCanvasElement | null>>
export const mapAffixLayerKey = Symbol('map-affix-layer') as InjectionKey<Ref<HTMLElement | null>>

export * from './transition'
