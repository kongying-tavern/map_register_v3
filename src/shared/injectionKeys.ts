import type { GenshinMapViewState } from '@/packages/map'

export const mapAffixKey = Symbol('map-affix') as InjectionKey<Ref<HTMLElement | undefined>>
export const mapContainerKey = Symbol('map-canvas') as InjectionKey<Ref<HTMLElement | undefined>>
export const mapContainerWidthKey = Symbol('map-canvas-width') as InjectionKey<Ref<number>>
export const mapContainerHeightKey = Symbol('map-canvas-height') as InjectionKey<Ref<number>>
export const mapViewStateKey = Symbol('map-view-state') as InjectionKey<Ref<GenshinMapViewState>>
