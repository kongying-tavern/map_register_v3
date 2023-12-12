import type { OrbitViewState } from '@deck.gl/core/typed'

declare namespace GSMapState {
  interface ViewState extends Omit<OrbitViewState, 'target'> {
    minZoom: number
    maxZoom: number
    target: API.Coordinate2D
  }
}
