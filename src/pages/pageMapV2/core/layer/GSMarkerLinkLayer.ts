import { LineLayer } from '@deck.gl/layers/typed'
import { PathStyleExtension } from '@deck.gl/extensions/typed'
import type { GSCompositeLayerState } from '.'
import type { GSMapState } from '@/stores/types/genshin-map-state'

/** 关联指示线图层 */
export class GSMarkerLinkLayer extends LineLayer<GSMapState.MLRenderUnit> {
  static layerName = 'GenshinMarkerLinkLayer'

  constructor(state: GSCompositeLayerState) {
    const {
      markersMap,
      markerLinkRenderList,
    } = state

    super({
      id: 'genshin-marker-link-layer',
      data: markerLinkRenderList,
      getSourcePosition: ({ source }) => {
        return markersMap[source].render.position
      },
      getTargetPosition: ({ target }) => {
        return markersMap[target].render.position
      },
      getWidth: 2,
      getColor: ({ type }) => ({
        TRIGGER: [255, 0, 0, 255],
        TRIGGER_ALL: [255, 255, 255, 255],
        TRIGGER_ANY: [0, 0, 0, 255],
        RELATED: [0, 255, 0, 255],
        EQUIVALENT: [0, 0, 255, 255],
      } as Record<GSMapState.MLRenderUnit['type'], [number, number, number, number]>)[type],
      extensions: [
        new PathStyleExtension({}),
      ],
    })
  }
}
