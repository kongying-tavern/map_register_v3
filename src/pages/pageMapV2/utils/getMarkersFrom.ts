import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer, MarkerWithRenderConfig } from '../core'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { useArchiveStore, useMapSettingStore, useMapStore } from '@/stores'
import { ICON } from '@/pages/pageMapV2/config'

/** 点位渲染属性 */
export const getMarkersFrom = (target: GenshinBaseLayer): IconLayer<MarkerWithRenderConfig> => {
  const conditionManager = useCondition()
  const archiveStore = useArchiveStore()
  const mapStore = useMapStore()
  const mapSettingStore = useMapSettingStore()

  const isMarked = (marker: API.MarkerVo) => {
    return archiveStore.currentArchive.body.Data_KYJG.has(marker.id!)
  }

  const getMarkerState = (marker: API.MarkerVo) => {
    return isMarked(marker) ? 'marked' : 'default'
  }

  const getMarkerPosition = (marker: API.MarkerVo) => {
    if (marker.extra?.underground?.is_underground)
      return 'underground'
    return 'aboveground'
  }

  const getMarkerOpacity = (marker: API.MarkerVo) => {
    if (isMarked(marker) && mapSettingStore.hideMarkedMarker)
      return ICON.inconspicuousOpacity
    return (marker.id === target.state.hover?.id) ? 0.8 : 1
  }

  return new IconLayer({
    id: `${target.props.id}-markers`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    data: conditionManager.layerMarkerMap[target.rawProps.code],
    pickable: true,
    iconAtlas: conditionManager.spiritImage,
    iconMapping: conditionManager.iconMapping,
    getIcon: (marker) => {
      return `${marker.render.itemId}_${getMarkerPosition(marker)}_${getMarkerState(marker)}`
    },
    getSize: (marker) => {
      return marker.id === mapStore.focus?.id ? 55 : 50
    },
    getColor: (marker) => {
      return [0, 0, 0, 255 * getMarkerOpacity(marker)]
    },
    getPosition: (marker) => {
      const [x, y] = marker.position?.split(',').map(Number) as [number, number]
      return target.context.deck.projectCoord([x, y])
    },
    sizeScale: 1,
    sizeMinPixels: 4,
    sizeMaxPixels: 50 * 2 ** (target.context.deck.mainViewState.zoom + 2),
    updateTriggers: {
      data: conditionManager.conditionStateId,
      getIcon: archiveStore.currentArchive.body.Data_KYJG.size,
      getColor: [
        mapStore.hover,
        mapSettingStore.hideMarkedMarker,
        archiveStore.currentArchive.body.Data_KYJG.size,
      ],
      getSize: mapStore.focus,
    },
  })
}
