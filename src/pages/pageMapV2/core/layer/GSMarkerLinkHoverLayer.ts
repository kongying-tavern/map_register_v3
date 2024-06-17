import { LineLayer } from '@deck.gl/layers/typed'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { LINK_ACTION_CONFIG } from '@/shared'

/** 关联指示线 hover 状态图层 */
export class GSMarkerLinkHoverLayer extends LineLayer<GSMapState.MLRenderUnit, LayerAttachOptions> {
  static layerName = 'GenshinMarkerLinkHoverLayer'

  constructor(state: GSCompositeLayerState) {
    const {
      markersMap,
      markerLinkRenderList,
      hover,
    } = state

    const isHover = (key: string) => {
      if (hover?.type !== 'defaultMarkerLink')
        return false
      return hover.value.key === key
    }

    super({
      id: 'genshin-marker-link-hover-layer',
      pickable: true,
      data: markerLinkRenderList,
      getWidth: 16,
      getColor: ({ type, key }) => {
        const [R, G, B] = LINK_ACTION_CONFIG[type].lineColor
        const A = isHover(key) ? 50 : 0
        return [R, G, B, A]
      },
      getSourcePosition: ({ source }) => markersMap.get(source)!.render.position,
      getTargetPosition: ({ target }) => markersMap.get(target)!.render.position,
      updateTriggers: {
        getColor: hover,
      },
    })
  }
}
