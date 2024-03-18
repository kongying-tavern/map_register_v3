import { IconLayer } from '@deck.gl/layers/typed'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import type { GSMapState } from '@/stores/types/genshin-map-state'

// TODO 应将该图层将与 GSMarkerLayer 合并为组合图层
export class GSMarkerHoverLayer extends IconLayer<number> {
  declare state: IconLayer['state'] & {
    data: GSMapState.MarkerWithRenderConfig[]
  }

  static layerName = 'GenshinMarkerHoverLayer'

  constructor(state: GSCompositeLayerState, { zoom }: LayerAttachOptions) {
    const {
      markersMap,
      markerDraggingMap,
      markerDraggingList,
      focus,
      hover,
      markerSpriteImage,
      markerSpriteMapping,
      markedMarkers,
      archiveHash,
      transparentMarked,
    } = state

    const getSize = focus?.type === 'defaultMarker'
      ? (id?: number) => focus.value.id === id ? 44 : 36
      : focus?.type === 'multipleMarkers'
        ? (id?: number) => focus.value.has(id!) ? 44 : 36
        : 36

    const isMarked = (id: number) => {
      return markedMarkers.has(id)
    }

    const getData = () => {
      const idSet = new Set<number>()
      if (hover?.type === 'defaultMarker')
        idSet.add(hover.value.id!)
      if (focus?.type === 'defaultMarker')
        idSet.add(focus.value.id!)
      if (focus?.type === 'multipleMarkers')
        return [...focus.value]
      return [...idSet]
    }

    super({
      id: 'genshin-marker-hover-layer',
      // 注意，此处为 marker hover 启用拾取，是为了使 hover 后产生的变化与交互体验一致（比如点位前置、点位放大等）
      // 由于 marker hover 盖住了 marker，因此依赖 hover 行为的交互操作 "可能" 需要使用该图层而非 marker 图层
      pickable: true,
      data: getData(),
      iconAtlas: markerSpriteImage,
      iconMapping: markerSpriteMapping,
      getIcon: (id) => {
        const { render: { isUnderground, mainIconTag } } = markersMap[id]
        const state = isMarked(id!) ? 'marked' : 'hover'
        const type = isUnderground ? 'underground' : 'default'
        return `${mainIconTag}.${state}.${type}`
      },
      getPosition: (id) => {
        const { render: { position } } = markersMap[id]
        const rewritePosition = markerDraggingMap[id]
        return rewritePosition ?? position
      },
      getSize,
      getColor: id => [0, 0, 0, (transparentMarked && isMarked(id!)) ? 51 : 255],
      sizeScale: 1,
      sizeMaxPixels: 40 * 2 ** (zoom + 2),
      sizeMinPixels: 4,
      updateTriggers: {
        getIcon: [hover, archiveHash],
        getPosition: [markerDraggingList],
        getSize: [hover, focus],
        getColor: [transparentMarked, archiveHash],
      },
    })
  }
}
