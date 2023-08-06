import { useMap } from '.'

export interface GenshinMapState {
  hover?: unknown
  focus?: unknown
  showBorder: boolean
  showTooltip: boolean
  showTags: boolean
  showOverlay: boolean
  maxCacheTileSize?: number
}

export const getDefaultMapState = (): GenshinMapState => ({
  hover: null,
  focus: null,
  showTags: true,
  showOverlay: false,
  showBorder: false,
  showTooltip: false,
})

export const useMapState = (isRoot = false) => {
  const { map, onMapReady } = useMap()

  const DEFAULT_STATE = getDefaultMapState()

  const mapStateRef = <K extends keyof GenshinMapState>(key: K) => computed({
    get: () => map.value?.stateManager.get(key) ?? DEFAULT_STATE[key],
    set: (v) => {
      map.value?.stateManager.set(key, v)
      triggerRef(map)
    },
  })

  const maxCacheTileSize = mapStateRef('maxCacheTileSize')
  const showBorder = mapStateRef('showBorder')
  const showOverlay = mapStateRef('showOverlay')
  const showTag = mapStateRef('showTags')
  const showTooltip = mapStateRef('showTooltip')

  if (isRoot) {
    onMapReady((mapInstance) => {
      mapInstance.stateManager.registerEffect('focus', () => mapInstance.baseLayer?.forceUpdate())
      mapInstance.stateManager.registerEffect('hover', () => mapInstance.baseLayer?.forceUpdate())
      mapInstance.stateManager.registerEffect('showBorder', () => mapInstance.baseLayer?.forceUpdate())
      mapInstance.stateManager.registerEffect('showOverlay', () => mapInstance.baseLayer?.forceUpdate())
      mapInstance.stateManager.registerEffect('showTags', () => mapInstance.baseLayer?.forceUpdate())
      mapInstance.stateManager.registerEffect('maxCacheTileSize', () => mapInstance.baseLayer?.forceUpdate())
    })
  }

  return {
    maxCacheTileSize,
    showBorder,
    showTag,
    showTooltip,
    showOverlay,
  }
}
