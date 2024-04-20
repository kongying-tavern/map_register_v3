import type { LayersList, UpdateParameters } from '@deck.gl/core/typed'
import { CompositeLayer } from '@deck.gl/core/typed'
import type { GenshinMap } from '../map'
import { EaseoutInterpolator } from '../interpolator'
import type { GSCompositeLayerState } from './GSCompositeLayerTypes'
import {
  GSDraggingLineLayer,
  GSMarkerHoverLayer,
  GSMarkerLayer,
  GSMarkerLinkHoverLayer,
  GSMarkerLinkLayer,
  GSOverlayer,
  GSTagLayer,
  GSTileLayer,
} from '.'
import { Logger } from '@/utils'
import { useArchiveStore, useIconTagStore, useMapStateStore, useOverlayStore, usePreferenceStore, useTileStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'

const logger = new Logger('图层组', () => !usePreferenceStore().preference['developer.setting.hideCompositeLayerLogger'])

// eslint-disable-next-line ts/no-explicit-any
interface StrategyOptions<D = any, T = any> {
  type: keyof GSMapState.InteractionTypeMap
  layer: Function
  getData: (object: D) => T
  isSameOne?: (value: T, oldValue: T) => boolean
}

const buildStrategy = <D, T>(options: StrategyOptions<D, T>) => options

interface InteractionStrategy {
  subscriber: ReturnType<ReturnType<typeof useMapStateStore>['subscribeInteractionInfo']>
  getData: (object: unknown) => void
  isSameOne?: (value: unknown, oldValue: unknown) => boolean
}

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
    const mapStateStore = useMapStateStore()

    const hoverStrategyOptionList: StrategyOptions[] = [
      buildStrategy<number, GSMapState.MarkerWithRenderConfig>({
        type: 'defaultMarker',
        layer: GSMarkerLayer,
        getData: object => this.state.markersMap[object],
        isSameOne: (a, b) => a.id === b.id,
      }),
      buildStrategy<number, GSMapState.MarkerWithRenderConfig>({
        type: 'defaultMarker',
        layer: GSMarkerHoverLayer,
        getData: object => this.state.markersMap[object],
        isSameOne: (a, b) => a.id === b.id,
      }),
      buildStrategy<GSMapState.MLRenderUnit, GSMapState.MLRenderUnit>({
        type: 'defaultMarkerLink',
        layer: GSMarkerLinkHoverLayer,
        getData: object => object,
        isSameOne: (a, b) => a.key === b.key,
      }),
    ]

    const focusStrategyOptionList: StrategyOptions[] = [
      {
        type: 'defaultMarker',
        layer: GSMarkerHoverLayer,
        getData: (object: number) => this.state.markersMap[object],
      },
    ]

    const hoverStrategies = hoverStrategyOptionList.reduce((strategies, { type, layer, getData, isSameOne }) => strategies.set(layer, {
      subscriber: mapStateStore.subscribeInteractionInfo('hover', type),
      getData,
      isSameOne,
    }), new Map<Function, InteractionStrategy>())

    const focusStrategies = focusStrategyOptionList.reduce((strategies, { type, layer, getData, isSameOne }) => strategies.set(layer, {
      subscriber: mapStateStore.subscribeInteractionInfo('focus', type),
      getData,
      isSameOne,
    }), new Map<Function, InteractionStrategy>())

    super({
      id: 'genshin-composite-layer',
      onHover: ({ object = null, sourceLayer = null }) => {
        if (!object || !sourceLayer) {
          hoverStrategies.forEach(({ subscriber }) => subscriber.update(null))
          return
        }
        const strategy = hoverStrategies.get(sourceLayer.constructor)
        if (!strategy)
          return
        const { subscriber, getData, isSameOne } = strategy
        const newValue = getData(object)
        if (isSameOne && subscriber.data.value && isSameOne(subscriber.data.value, newValue))
          return
        subscriber.update(newValue)
      },
      onClick: ({ object = null, sourceLayer = null }, ev) => {
        if (('leftButton' in ev && !ev.leftButton) || !object || !sourceLayer) {
          focusStrategies.forEach(({ subscriber }) => subscriber.update(null))
          return
        }
        const strategy = focusStrategies.get(sourceLayer.constructor)
        if (!strategy)
          return
        const { subscriber, getData, isSameOne } = strategy
        const newValue = getData(object)
        if (isSameOne && subscriber.data.value && isSameOne(subscriber.data.value, newValue))
          return
        subscriber.update(newValue)
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
        areaCode: preferenceStore.preference['markerFilter.state.areaCode'],
        tileConfig: tileStore.currentTileConfig,
        isViewPortChanging: mapStateStore.isViewPortChanging,
        // tag
        showZoneTag: preferenceStore.preference['map.setting.showZoneTag'],
        visibleTagGroups: tileStore.visibleTagGroups,
        // marker
        hover: mapStateStore.hover as GSMapState.InteractionInfo | null,
        focus: mapStateStore.focus as GSMapState.InteractionInfo | null,
        markersMap: mapStateStore.currentLayerMarkersMap,
        markersIds: mapStateStore.currentLayerMarkersIds,
        markerDraggingMap: markerDraggingMap.value,
        markerDraggingList: markerDraggingList.value,
        markerSpriteMapping: iconTagStore.markerSpriteMapping,
        markerSpriteImage: iconTagStore.markerSpriteUrl,
        markedMarkers: archiveStore.currentArchive.body.Data_KYJG,
        markerLinkRenderList: mapStateStore.markerLinkRenderList,
        archiveHash: archiveStore.hash,
        transparentMarked: preferenceStore.preference['map.setting.transparentMarked'],
        // overlay
        showOverlay: preferenceStore.preference['map.state.showOverlay'],
        showOverlayMask: overlayStore.showMask,
        normalOverlays: overlayStore.normalOverlays,
        tileLikeOverlays: overlayStore.tileLikeOverlays,
        topOverlayInGroup: overlayStore.topOverlayInGroup,
        hiddenOverlayGroups: overlayStore.hiddenOverlayGroups,
        overlayStateId: overlayStore.stateId,
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
    // this.#reactiveEffectRunner = this.#linkToVueReactiveSystem()
  }

  /** @生命周期 确认更新 */
  shouldUpdateState({ changeFlags }: UpdateParameters<GSCompositeLayer>): boolean {
    return changeFlags.somethingChanged
  }

  /** @生命周期 销毁状态 */
  finalizeState = (context: typeof this.context) => {
    this.#effectCleaner?.()
    super.finalizeState(context)
  }

  /** @生命周期 刷新图层，只要 shouldUpdateState 返回为 true 就会执行 */
  renderLayers = (): LayersList => {
    const { tileConfig, markerSpriteImage } = this.state

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

      // 点位关联指示线 hover 状态图层
      new GSMarkerLinkHoverLayer(this.state),

      // 点位关联指示线
      new GSMarkerLinkLayer(this.state, options),

      // 拖拽点位时的指示线
      new GSDraggingLineLayer(this.state),

      // 点位图层，必须确保点位精灵图存在才能加载此图层
      markerSpriteImage ? new GSMarkerLayer(this.state, options) : undefined,

      // 点位图层 hover 状态图层
      markerSpriteImage ? new GSMarkerHoverLayer(this.state, options) : undefined,
    ]
  }
}
