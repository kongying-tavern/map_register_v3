import type { InjectionKey } from 'vue'

export const MAP_FONTFAMILY = 'map-font-zhcn'

/**
 * 地上图标 默认状态
 * [`${itemId}`_default]: {}
 *
 * 地上图标 hover 状态
 * [`${itemId}`_hover]: {}
 *
 * 地上图标 active 状态
 * [`${itemId}`_active]: {}
 *
 * 地上图标 focus 状态
 * [`${itemId}`_focus]: {}
 *
 * 地上图标 marked 状态
 * [`${itemId}`_marked]: {}
 *
 * 地下图标 默认状态
 * [`${itemId}`_ug_default]: {}
 *
 * 地下图标 hover 状态
 * [`${itemId}`_ug_hover]: {}
 *
 * 地下图标 active 状态
 * [`${itemId}`_ug_active]: {}
 *
 * 地下图标 focus 状态
 * [`${itemId}`_ug_focus]: {}
 *
 * 地下图标 marked 状态
 * [`${itemId}`_ug_marked]: {}
 */
export const ICON_MAPPING_STATES = [
  '_default',
  '_hover',
  '_active',
  '_focus',
  '_marked',
  '_ug_default',
  '_ug_hover',
  '_ug_active',
  '_ug_focus',
  '_ug_marked',
]

export const mutuallyExclusiveLayerKey = Symbol('mutually-exclusive-layer') as InjectionKey<Ref<HTMLElement | null>>
export const genshinMapCanvasKey = Symbol('canvas-ref') as InjectionKey<Ref<HTMLCanvasElement | null>>
export const mapAffixLayerKey = Symbol('map-affix-layer') as InjectionKey<Ref<HTMLElement | null>>

export * from './transition'
