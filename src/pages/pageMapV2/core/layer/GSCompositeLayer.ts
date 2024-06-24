import type { LayersList, UpdateParameters } from '@deck.gl/core'
import { CompositeLayer } from '@deck.gl/core'
import type { GenshinMap } from '../map'
import { EaseoutInterpolator } from '../interpolator'
import type { GSCompositeLayerState } from './GSCompositeLayerTypes'
import {
  GSDraggingLineLayer,
  GSMarkerLayer,
  GSMarkerLinkLayer,
  GSOverlayer,
  GSTagLayer,
  GSTileLayer,
} from '.'
import { Logger } from '@/utils'
import { useArchiveStore, useIconTagStore, useMapStateStore, useOverlayStore, usePreferenceStore, useTileStore } from '@/stores'

const logger = new Logger('图层组')

export class GSCompositeLayer extends CompositeLayer {
  // ==================== type declare  ====================

  declare context: CompositeLayer['context'] & {
    deck: GenshinMap
  }

  declare state: GSCompositeLayerState

  // ==================== static member  ====================

  static layerName = 'GenshinCompositeLayer'

  // ====================   constructor  ====================

  constructor() {
    super({
      id: 'genshin-composite-layer',
      onHover: (info, event) => {
        const layers = this.getSubLayers()
        layers.filter(layer => layer.id === info.sourceLayer?.id).forEach(layer => layer.props.onHover?.(info, event))
      },
      onClick: (info, event) => {
        const layers = this.getSubLayers()
        layers.filter(layer => layer.id === info.sourceLayer?.id).forEach(layer => layer.props.onClick?.(info, event))
      },
      onDrag: (info, event) => {
        this.getSubLayers().filter((layer) => {
          return layer.id === info.sourceLayer?.id
        }).forEach(layer => layer.props.onDrag?.(info, event))
      },
      onDragEnd: (info, event) => {
        this.getSubLayers().filter(layer => layer.id === info.sourceLayer?.id).forEach(layer => layer.props.onDragEnd?.(info, event))
      },
      onDragStart: (info, event) => {
        this.getSubLayers().filter(layer => layer.id === info.sourceLayer?.id).forEach(layer => layer.props.onDragStart?.(info, event))
      },
    })
  }

  // ==================== private member ====================

  /** 保留响应式控制器，在销毁阶段释放对应的响应式依赖 */
  #effectCleaner?: () => void

  // ==================== private method ====================

  /** 使用 vue 的响应式系统处理依赖 */
  #linkToVueReactiveSystem = () => {
    const scope = effectScope()
    scope.run(() => {
      const archiveStore = useArchiveStore()
      const tileStore = useTileStore()
      const iconTagStore = useIconTagStore()
      const preferenceStore = usePreferenceStore()
      const mapStateStore = useMapStateStore()
      const overlayStore = useOverlayStore()

      const { data: markerDraggingMap } = mapStateStore.subscribeMission('markerDragging', () => ({}))

      const markerDraggingList = computed(() => {
        const list: { id: string; position: API.Coordinate2D }[] = []
        const map = markerDraggingMap.value
        for (const id in map)
          list.push({ id, position: map[id] })
        return list
      })

      watch((): Partial<GSCompositeLayerState> => ({
        // 其他
        areaCode: preferenceStore.preference['markerFilter.state.areaCode'],
        tileConfig: tileStore.currentTileConfig,
        isViewPortChanging: mapStateStore.isViewPortChanging,
        // 交互
        interactionTimestamp: mapStateStore.interactionTimestamp,
        // 标签
        showZoneTag: preferenceStore.preference['map.setting.showZoneTag'],
        visibleTagGroups: tileStore.visibleTagGroups,
        // 点位
        markersMap: mapStateStore.currentMarkerIdMap,
        markersIds: mapStateStore.currentMarkerIds,
        markerDraggingMap: markerDraggingMap.value,
        markerDraggingList: markerDraggingList.value,
        markerSpriteMapping: iconTagStore.markerSpriteMapping,
        markerSpriteImage: iconTagStore.markerSpriteUrl,
        markedMarkers: archiveStore.currentArchive.body.Data_KYJG,
        markerLinkRenderList: mapStateStore.markerLinkRenderList,
        archiveHash: archiveStore.hash,
        transparentMarked: preferenceStore.preference['map.setting.transparentMarked'],
        // 附加图层
        showOverlayMask: overlayStore.showMask,
        chunkMap: overlayStore.chunkMap,
        normalChunks: overlayStore.visibleChunks.normal,
        tileLikeChunks: overlayStore.visibleChunks.tiles,
      }), (newState, oldState) => {
        const { tileConfig } = newState
        if (!tileConfig)
          return

        const moveToTarget = () => {
          if (newState.areaCode === this.state.areaCode)
            return
          const { target: [x, y], zoom } = tileConfig.initViewState
          const [ox, oy] = tileConfig.tile.center
          this.context.deck.setProps({
            initialViewState: {
              target: [x + ox, y + oy],
              zoom,
              transitionDuration: 1000,
              transitionInterpolator: new EaseoutInterpolator(['target', 'zoom']),
            },
          })
        }
        moveToTarget()

        if (!oldState) {
          this.setState(newState)
          return
        }

        this.setState(newState)
      }, { immediate: true })
    })
    logger.info('初始化作用域', scope)
    this.#effectCleaner = () => {
      scope.stop()
      this.#effectCleaner = undefined
    }
  }

  // ==================== public method  ====================

  /** 状态更新，使用默认实现，但覆盖其类型 */
  setState(updateObject: Partial<typeof this.state>): void {
    super.setState(updateObject)
  }

  /** @生命周期 初始化 */
  initializeState = (/** context: typeof this.context */) => {
    super.initializeState(this.context)
    this.#linkToVueReactiveSystem()
  }

  /** @生命周期 确认更新 */
  shouldUpdateState({ changeFlags }: UpdateParameters<CompositeLayer>): boolean {
    return changeFlags.somethingChanged
  }

  /** @生命周期 销毁状态 */
  finalizeState = (context: typeof this.context) => {
    this.#effectCleaner?.()
    super.finalizeState(context)
  }

  /** @生命周期 刷新图层，只要 shouldUpdateState 返回为 true 就会执行 */
  renderLayers = (): LayersList => {
    const { tileConfig } = this.state

    const options = {
      zoom: this.context.viewport.zoom,
    }

    return [
      // 底图图层，必须确保 tileConfig 存在才能加载此图层
      tileConfig ? new GSTileLayer(this.state) : undefined,

      // 附加图层
      tileConfig ? new GSOverlayer(this.state) : undefined,

      // 地区标签图层
      tileConfig ? new GSTagLayer(this.state, options) : undefined,

      // 点位关联指示线
      new GSMarkerLinkLayer(this.state, options),

      // 拖拽点位时的指示线
      new GSDraggingLineLayer(this.state),

      // 点位图层
      new GSMarkerLayer(this.state, options),
    ]
  }
}
