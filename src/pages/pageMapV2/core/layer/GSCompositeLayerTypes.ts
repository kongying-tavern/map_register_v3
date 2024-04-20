import type { IconMapping } from '@deck.gl/layers/typed/icon-layer/icon-manager'
import type { Texture } from '@deck.gl/core/typed'
import type { AreaTileConfig, OverlayChunk } from '@/stores'
import type { AreaTagTuple } from '@/configs'
import type { GSMapState } from '@/stores/types/genshin-map-state'

export interface GSCompositeLayerState {
  areaCode?: string
  tileConfig?: AreaTileConfig
  isViewPortChanging: boolean
  // tag
  showZoneTag?: boolean
  visibleTagGroups: AreaTagTuple[][]
  // marker
  hover: GSMapState.InteractionInfo | null
  focus: GSMapState.InteractionInfo | null
  markersMap: Record<number, GSMapState.MarkerWithRenderConfig>
  markersIds: number[]
  markerDraggingMap: Record<number, API.Coordinate2D>
  markerDraggingList: { id: string; position: API.Coordinate2D }[]
  markerSpriteImage: string | Texture
  markerSpriteMapping: IconMapping
  markedMarkers: Set<number>
  markerLinkRenderList: GSMapState.MLRenderUnit[]
  archiveHash: string
  transparentMarked: boolean
  // overlay
  showOverlay: boolean
  showOverlayMask: boolean
  normalOverlays: OverlayChunk[]
  tileLikeOverlays: OverlayChunk[]
  topOverlayInGroup: Record<string, string>
  hiddenOverlayGroups: Set<string>
  overlayStateId: number
  chunkMap: Map<string, OverlayChunk>
  normalChunks: string[]
  tileLikeChunks: string[]
}

export interface LayerAttachOptions {
  zoom: number
}
