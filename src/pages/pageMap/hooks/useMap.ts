import L from 'leaflet'
import type { Ref } from 'vue'
import type { MapNameEnum } from '../configs'
import { GenshinTileLayer, MapUtil } from '../utils'

interface MapHookOptions {
  mapOptions?: L.MapOptions
}

export const useMap = (ele: Ref<HTMLElement | null>, options: MapHookOptions = {}) => {
  const { mapOptions } = options

  const mapRef = ref<L.Map | null>(null) as Ref<L.Map>
  const layerRef = ref<L.Layer | null>(null) as Ref<L.Layer>

  const switchMap = (name: MapNameEnum) => {
    if (!ele.value)
      return

    const tile = GenshinTileLayer.getLayer(name)

    if (mapRef.value) {
      layerRef.value && mapRef.value.removeLayer(layerRef.value)
      mapRef.value.addLayer(tile)
      layerRef.value = tile
      return
    }

    const { settings, center = [0, 0], size = [0, 0], tilesOffset = [0, 0] } = tile.tileConfig

    const [centerX, centerY] = center
    const [offsetX, offsetY] = tilesOffset
    const [w, h] = size

    const mapCRS = MapUtil.getMapCRS(centerX, centerY, w, h)

    mapRef.value = L.map(ele.value, {
      crs: mapCRS,
      center: [2576, 1742],
      zoomDelta: 0,
      zoomSnap: 0.5,
      maxZoom: 2,
      minZoom: -4,
      zoom: -4,
      tap: false,
      attributionControl: false,
      zoomControl: false,
      maxBounds: L.latLngBounds(
        L.latLng(-centerX + offsetX - 10000, -centerY + offsetY - 10000),
        L.latLng(w - centerX + offsetX + 10000, h - centerY + offsetY + 10000),
      ),
      ...settings,
      ...mapOptions,
    }).addLayer(tile)
    layerRef.value = tile
  }

  return { switchMap }
}
