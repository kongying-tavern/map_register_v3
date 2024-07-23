import type { InjectionKey } from 'vue'

export const mutuallyExclusiveLayerKey = Symbol('mutually-exclusive-layer') as InjectionKey<Ref<HTMLElement | undefined>>
export const genshinMapCanvasKey = Symbol('canvas-ref') as InjectionKey<Ref<HTMLCanvasElement | undefined>>
export const mapAffixLayerKey = Symbol('map-affix-layer') as InjectionKey<Ref<HTMLElement | undefined>>
export const mapSidermenuKey = Symbol('map-sidermenu-ref') as InjectionKey<Ref<HTMLElement | undefined>>

export * from './transition'
