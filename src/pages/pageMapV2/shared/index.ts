import type { InjectionKey } from 'vue'

export const MAP_FONTFAMILY = 'map-font-zhcn'

export const mutuallyExclusiveLayerKey = Symbol('mutually-exclusive-layer') as InjectionKey<Ref<HTMLElement | null>>
export const genshinMapCanvasKey = Symbol('canvas-ref') as InjectionKey<Ref<HTMLCanvasElement | null>>
export const mapAffixLayerKey = Symbol('map-affix-layer') as InjectionKey<Ref<HTMLElement | null>>
export const mapSidermenuKey = Symbol('map-sidermenu-ref') as InjectionKey<Ref<HTMLElement | null>>

export * from './transition'
