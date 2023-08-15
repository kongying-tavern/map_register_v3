import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer, MarkerWithRenderConfig } from '../core'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { useArchiveStore } from '@/stores'
import { isMarkerVo } from '@/utils'

/** 点位渲染属性 */
export const getMarkersFrom = (target: GenshinBaseLayer): IconLayer<MarkerWithRenderConfig> => {
  const conditionManager = useCondition()
  const { stateManager } = target.context.deck
  const archiveStore = useArchiveStore()

  const isFocus = (marker: API.MarkerVo) => {
    const { focus } = stateManager.state
    return isMarkerVo(focus) && marker.id === focus.id
  }

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
    if (isMarked(marker) && stateManager.get('hideMarkedMarker'))
      return 0.2
    const { hover } = stateManager.state
    return (isMarkerVo(hover) && marker.id === hover.id) ? 0.8 : 1
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
      return isFocus(marker) ? 55 : 50
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
      getIcon: [
        archiveStore.currentArchive.body.Data_KYJG.size,
      ],
      getColor: [
        stateManager.state.hover,
        stateManager.state.hideMarkedMarker,
      ],
      getSize: [
        stateManager.state.focus,
      ],
    },
  })
}
