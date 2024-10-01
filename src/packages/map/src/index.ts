import type { DeckProps, OrthographicView } from '@deck.gl/core'
import type { ControllerOptions } from 'node_modules/@deck.gl/core/dist/controllers/controller'

export interface GenshinMapProps extends DeckProps<OrthographicView> {
  canvas: HTMLCanvasElement
  controller?: ControllerOptions & {
    scrollZoom?: {
      speed?: number
      smooth?: boolean
      transitionDuration?: number | (() => number)
    }
  }
}
