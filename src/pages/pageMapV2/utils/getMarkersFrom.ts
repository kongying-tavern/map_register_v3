import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer, MarkerWithRenderConfig } from '../core'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { ICON } from '@/pages/pageMapV2/config'

const getMarkerPosition = (marker: API.MarkerVo) => {
  if (marker.extra?.underground?.is_underground)
    return 'underground'
  return 'aboveground'
}

/**
 * 点位图层
 * @todo 后续将点位要素拆分为 IconLayer 组合图层，以避免重复预渲染带来的性能问题
 */
export const getMarkersFrom = (target: GenshinBaseLayer): IconLayer<MarkerWithRenderConfig> => {
  const conditionManager = useCondition()
  const { archive, map: mapState, setting } = target.context.deck.store

  const isMarked = (marker: API.MarkerVo) => {
    return archive.currentArchive.body.Data_KYJG.has(marker.id!)
  }

  const getMarkerSize = (marker: API.MarkerVo) => {
    return mapState.getFocus('marker')?.id === marker.id ? ICON.size.scaleSize : ICON.size.displaySize
  }

  const getMarkerState = (marker: API.MarkerVo) => {
    return isMarked(marker) ? 'marked' : 'default'
  }

  const getMarkerOpacity = (marker: API.MarkerVo) => {
    if (isMarked(marker) && setting.hideMarkedMarker)
      return ICON.inconspicuousOpacity
    return (marker.id === mapState.getHover('marker')?.id) ? 0.8 : 1
  }

  return new IconLayer({
    id: `${target.props.id}-markers`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    data: conditionManager.markers,
    pickable: true,
    iconAtlas: conditionManager.spiritImage,
    iconMapping: conditionManager.iconMapping,
    getIcon: marker => `${marker.render.itemId}_${getMarkerPosition(marker)}_${getMarkerState(marker)}`,
    getSize: getMarkerSize,
    getColor: marker => [0, 0, 0, 255 * getMarkerOpacity(marker)],
    getPosition: (marker) => {
      const [x, y] = marker.position!.split(',').map(Number) as [number, number]
      return target.context.deck.projectCoord([x, y])
    },
    sizeScale: 1,
    sizeMinPixels: 4,
    sizeMaxPixels: ICON.size.displaySize * 2 ** (target.context.deck.mainViewState.zoom + 2),
    transitions: {
      getSize: 66,
      getColor: 66,
    },
    updateTriggers: {
      data: conditionManager.conditionStateId,
      getIcon: archive.currentArchive.body.Data_KYJG.size,
      getColor: [
        mapState.getHover('marker'),
        setting.hideMarkedMarker,
        archive.currentArchive.body.Data_KYJG.size,
      ],
      getSize: mapState.getFocus('marker'),
    },
  })
}
