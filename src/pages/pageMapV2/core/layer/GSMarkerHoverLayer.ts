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
      markedMarkers,
      markerSpriteImage,
      markerSpriteMapping,
    } = state

    const isMarked = (id: number) => {
      return markedMarkers.has(id)
    }

    const getSize = focus?.type === 'defaultMarker'
      ? (id?: number) => focus.value.id === id ? 44 : 36
      : focus?.type === 'multipleMarkers'
        ? (id?: number) => focus.value.has(id!) ? 44 : 36
        : 36

    /** 由于 id 进行了重排，需要确保 y 坐标更低的排在后面 */
    const sorter = (idA: number, idB: number) => {
      return markersMap.get(idA)!.render.position[1] - markersMap.get(idB)!.render.position[1]
    }

    const getData = () => {
      const idSet = new Set<number>()
      let ids: number[] | undefined
      if (focus?.type === 'defaultMarker' && markersMap.has(focus.value.id!))
        idSet.add(focus.value.id!)
      if (focus?.type === 'multipleMarkers')
        focus.value.forEach(id => markersMap.has(id) && idSet.add(id))
      if (hover?.type === 'defaultMarker' && markersMap.has(hover.value.id!)) {
        idSet.delete(hover.value.id!)
        ids = [...idSet].sort(sorter)
        ids.push(hover.value.id!) // 确保 hover 在最顶层
      }
      ids ??= [...idSet].sort(sorter)
      return ids
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
        const { render: { isUnderground, mainIconTag } } = markersMap.get(id)!
        const state = isMarked(id!) ? 'marked' : 'default'
        const type = isUnderground ? 'underground' : 'default'
        return `${mainIconTag}.${state}.${type}`
      },
      getPosition: (id) => {
        const { render: { position } } = markersMap.get(id)!
        const rewritePosition = markerDraggingMap[id]
        return rewritePosition ?? position
      },
      getSize,
      getColor: [0, 0, 0, 255],
      sizeScale: 1,
      sizeMaxPixels: 40 * 2 ** (zoom + 2),
      sizeMinPixels: 4,
      updateTriggers: {
        getPosition: [markerDraggingList],
        getSize: [hover, focus],
      },
    })
  }
}
