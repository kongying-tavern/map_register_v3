import L from 'leaflet'
import type { Ref } from 'vue'
import type { MapNameEnum } from '../configs'
import { GenshinTileLayer, MapUtil } from '../utils'
import { mapTiles } from '../configs'

interface MapHookOptions {
  mapOptions?: L.MapOptions
}

const tileOptions = Object.entries(mapTiles).reduce((seed, [key, mapTileConfig]) => {
  mapTileConfig.code && seed.push(key as MapNameEnum)
  return seed
}, [] as MapNameEnum[])

export const useMap = (ele: Ref<HTMLElement | null>, options: MapHookOptions = {}) => {
  const { mapOptions } = options

  const map = ref<L.Map | null>(null) as Ref<L.Map | null>
  const zoom = ref(NaN)
  const mapName = ref<MapNameEnum>(tileOptions[0])

  /** 事件初始化 */
  const initHandler = (map: L.Map) => {
    zoom.value = map.getZoom()
    map.on('zoomend', () => {
      zoom.value = map.getZoom() ?? 0
    })
  }

  /** 切换地图 */
  const switchMap = (name: MapNameEnum) => {
    if (!ele.value)
      return

    const tile = GenshinTileLayer.getLayer(name)

    if (map.value) {
      map.value.off()
      map.value.remove()
    }

    const { settings, center = [0, 0], size = [0, 0], tilesOffset = [0, 0] } = tile.tileConfig

    const [centerX, centerY] = center
    const [offsetX, offsetY] = tilesOffset
    const [w, h] = size

    const mapCRS = MapUtil.getMapCRS(centerX, centerY, w, h)

    const newMap = L.map(ele.value, {
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

    map.value = newMap

    initHandler(newMap)
  }

  watch(mapName, switchMap)

  onMounted(() => {
    switchMap(mapName.value)
  })

  /** 卸载前清理掉事件和渲染器以避免内存泄漏 */
  onBeforeUnmount(() => {
    if (!map.value)
      return
    map.value.off()
    map.value.remove()
  })

  return { map, mapName, zoom, tileOptions, switchMap }
}
