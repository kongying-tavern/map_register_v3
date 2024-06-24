import type { IconLayerProps } from '@deck.gl/layers'
import type { AreaTileConfig, OverlayChunk } from '@/stores'
import type { AreaTagTuple } from '@/configs'
import type { GSMapState } from '@/stores/types/genshin-map-state'

export interface GSCompositeLayerState extends Record<string, unknown> {
  areaCode?: string
  tileConfig?: AreaTileConfig
  isViewPortChanging: boolean
  // tag
  showZoneTag?: boolean
  visibleTagGroups: AreaTagTuple[][]
  // 交互
  interactionTimestamp: number
  markersMap: Map<number, GSMapState.MarkerWithRenderConfig>
  markersIds: number[]
  markerDraggingMap: Record<number, API.Coordinate2D>
  markerDraggingList: { id: string; position: API.Coordinate2D }[]
  markerSpriteImage: IconLayerProps['iconAtlas']
  markerSpriteMapping: IconLayerProps['iconMapping']
  markedMarkers: Set<number>
  markerLinkRenderList: GSMapState.MLRenderUnit[]
  archiveHash: string
  transparentMarked: boolean
  // overlay
  showOverlayMask: boolean
  chunkMap: Map<string, OverlayChunk>
  normalChunks: string[]
  tileLikeChunks: string[]
}

export interface LayerAttachOptions {
  zoom: number
}
