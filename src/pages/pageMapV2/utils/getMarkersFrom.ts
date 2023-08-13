import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import { MARKER_POSITION } from '../shared'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { useArchiveStore } from '@/stores'
import { isMarkerVo } from '@/utils'

/** 点位渲染属性 */
export const getMarkersFrom = (target: GenshinBaseLayer): IconLayer<API.MarkerVo> => {
  const conditionManager = useCondition()
  const { stateManager } = target.context.deck
  const archiveStore = useArchiveStore()

  // TODO 优化可能
  // 由于每个 marker 有多个物品，但并不是每个物品在预渲染时都会被 iconMap 收集，这里只能去找存在于 iconMap 里的物品
  const findValidItemId = (items: API.MarkerItemLinkVo[] = []) => {
    for (const { itemId = -1 } of items) {
      if (MARKER_POSITION.some(pos => `${itemId}_${pos}_default` in conditionManager.iconMapping))
        return itemId
    }
    return -1
  }

  const isHover = (marker: API.MarkerVo) => {
    const { hover } = stateManager.state
    return isMarkerVo(hover) && marker.id === hover.id
  }

  const isFocus = (marker: API.MarkerVo) => {
    const { focus } = stateManager.state
    return isMarkerVo(focus) && marker.id === focus.id
  }

  const getMarkerState = (marker: API.MarkerVo) => {
    if (archiveStore.currentArchive.body.Data_KYJG.has(marker.id!))
      return stateManager.get('hideMarkedMarker') ? 'inconspicuous' : 'marked'
    return 'default'
  }

  const getMarkerPosition = (marker: API.MarkerVo) => {
    if (marker.extra?.underground?.is_underground)
      return 'underground'
    return 'aboveground'
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
      return `${findValidItemId(marker.itemList)}_${getMarkerPosition(marker)}_${getMarkerState(marker)}`
    },
    getSize: (marker) => {
      return isFocus(marker) ? 55 : 50
    },
    getColor: (marker) => {
      return isHover(marker) ? [0, 0, 0, 204] : [0, 0, 0, 255]
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
        stateManager.state.hideMarkedMarker,
      ],
      getColor: [
        stateManager.state.hover,
      ],
      getSize: [
        stateManager.state.focus,
      ],
    },
  })
}
