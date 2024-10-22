import type { LayersList } from '@deck.gl/core'
import { useMarkerLayer } from './useMarkerLayer'
import {
  GSOverlayer,
  GSTagLayer,
  GSTileLayer,
} from '@/packages/map'
import {
  useOverlayStore,
  useTileStore,
} from '@/stores'
import type { useResourceStatus } from '@/hooks'

interface MapLayerHookOptions {
  resourceStatus: ReturnType<typeof useResourceStatus>['status']
}

export const useMapLayers = (options: MapLayerHookOptions) => {
  const { resourceStatus } = options

  const tileStore = useTileStore()
  const overlayStore = useOverlayStore()

  // ============================== 底图图层 ==============================
  const tileLayer = computed(() => {
    const tile = tileStore.currentTileConfig?.tile
    if (!tile)
      return
    return new GSTileLayer({
      code: tile.code,
      size: tile.size,
      extension: tile.extension,
      tilesOffset: tile.tilesOffset,
    })
  })

  // ============================== 附加图层 ==============================
  const overlayer = computed(() => {
    if (!tileStore.currentTileConfig)
      return
    const [w, h] = tileStore.currentTileConfig.tile.size
    const [ox, oy] = tileStore.currentTileConfig.tile.tilesOffset
    const xmin = ox
    const ymin = oy
    const xmax = w + ox
    const ymax = h + oy
    return new GSOverlayer({
      bounds: [xmin, ymin, xmax, ymax],
      showOverlayMask: overlayStore.showMask,
      chunkMap: overlayStore.chunkMap,
      normalChunks: overlayStore.visibleChunks.default,
      tileLikeChunks: overlayStore.visibleChunks.tile,
    })
  })

  // ============================== 标签图层 ==============================
  const tagLayer = computed(() => {
    const tile = tileStore.currentTileConfig?.tile
    if (!tile || !resourceStatus.value.fonts)
      return
    return new GSTagLayer({
      tagGroups: tileStore.visibleTagGroups,
      offset: tile.center,
    })
  })

  // ============================== 点位图层 ==============================
  const { markerLayer } = useMarkerLayer()

  const layers = computed<LayersList>(() => [
    tileLayer.value,
    overlayer.value,
    tagLayer.value,
    markerLayer.value,
  ])

  return {
    layers,
  }
}