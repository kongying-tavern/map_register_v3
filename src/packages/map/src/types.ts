import type { DeckProps, OrthographicView, OrthographicViewState } from '@deck.gl/core'
import type { ControllerOptions } from 'node_modules/@deck.gl/core/dist/controllers/controller'

export interface GenshinMapProps extends Omit<DeckProps<OrthographicView>, 'canvas'> {
  controller?: ControllerOptions & {
    scrollZoom?: {
      speed?: number
      smooth?: boolean
      transitionDuration?: number | (() => number)
    }
  }
}

export interface GenshinMapViewState extends OrthographicViewState {
  target?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
}
