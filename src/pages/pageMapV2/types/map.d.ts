import type { DeckProps } from '@deck.gl/core'
import type { OrthographicView } from '@deck.gl/core'
import type { GenshinMap } from '../core'
import type { GSMapState } from '@/stores/types/genshin-map-state'

declare namespace GSMap {
  interface ConstructorOptions extends DeckProps {
    canvas: HTMLCanvasElement
    zoomTransitionDuration?: () => number
  }

  interface EventMap {
    hover: Parameters<NonNullable<DeckProps<OrthographicView>['onHover']>>
    click: Parameters<NonNullable<DeckProps<OrthographicView>['onClick']>>
    dragStart: Parameters<NonNullable<DeckProps<OrthographicView>['onDragStart']>>
    drag: Parameters<NonNullable<DeckProps<OrthographicView>['onDrag']>>
    viewStateChange: Parameters<NonNullable<DeckProps<OrthographicView>['onViewStateChange']>>
    load: [map: GenshinMap]
    setViewState: [state: Partial<GSMapState.ViewState>]
  }
}
