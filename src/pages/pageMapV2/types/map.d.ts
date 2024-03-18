import type { DeckProps } from '@deck.gl/core/typed'
import type { GenshinMap } from '../core'
import type { GSMapState } from '@/stores/types/genshin-map-state'

declare namespace GSMap {
  type ExtractParamters<T extends keyof DeckProps> = Parameters<NonNullable<DeckProps[T]>>

  interface ConstructorOptions extends DeckProps {
    canvas: HTMLCanvasElement
  }

  interface EventMap {
    hover: ExtractParamters<'onHover'>
    click: ExtractParamters<'onClick'>
    dragStart: ExtractParamters<'onDragStart'>
    drag: ExtractParamters<'onDrag'>
    viewStateChange: ExtractParamters<'onViewStateChange'>
    load: [map: GenshinMap]
    setViewState: [state: Partial<GSMapState.ViewState>]
  }
}
