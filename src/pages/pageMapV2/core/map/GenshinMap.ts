import type { DeckProps } from '@deck.gl/core/typed'
import { Deck, OrthographicView, TRANSITION_EVENTS } from '@deck.gl/core/typed'
import type { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller'
import { pick } from 'lodash'
import { MAP_FONTFAMILY, TRANSITION } from '../../shared'
import { useCondition } from '../../hooks'
import { EventBus, GenshinBaseLayer } from '..'
import type { GensinMapViewState } from '.'
import { getCursor, getTooltip, handleViewStateChange } from '.'
import genshinFont from '@/style/fonts/genshinFont.woff2?url'
import { useArchiveStore, useMapSettingStore, useMapStore, useOverlayStore, useTileStore } from '@/stores'

export interface GenshinMapOptions extends DeckProps {
  canvas: HTMLCanvasElement
}

type ExtractParamters<T extends keyof DeckProps> = Parameters<NonNullable<DeckProps[T]>>

export interface GenshinMapEvents {
  afterRender: ExtractParamters<'onAfterRender'>
  beforeRender: ExtractParamters<'onBeforeRender'>
  click: ExtractParamters<'onClick'>
  drag: ExtractParamters<'onDrag'>
  dragEnd: ExtractParamters<'onDragEnd'>
  dragStart: ExtractParamters<'onDragStart'>
  error: ExtractParamters<'onError'>
  hover: ExtractParamters<'onHover'>
  interactionStateChange: ExtractParamters<'onInteractionStateChange'>
  load: [GenshinMap]
  resize: ExtractParamters<'onResize'>
  viewStateChange: [ViewStateChangeParameters]
  WebGLInitialized: ExtractParamters<'onWebGLInitialized'>
}

interface ChromeFontFaceSet extends FontFaceSet {
  add: Set<FontFace>['add']
  has: Set<FontFace>['has']
}

export class GenshinMap extends Deck {
  static create = async (options: GenshinMapOptions) => {
    const fonts = document.fonts as unknown as ChromeFontFaceSet
    const mhyGameFont = new FontFace(MAP_FONTFAMILY, `url(${genshinFont})`)
    await mhyGameFont.load()
    fonts.add(mhyGameFont)
    return new this(options)
  }

  static instance: GenshinMap

  static getDefaultViewState = (): GensinMapViewState => ({
    maxRotationX: 90,
    minRotationX: -90,
    rotationX: 0,
    rotationOrbit: 0,
    zoom: -4,
    minZoom: -4,
    maxZoom: 2,
    target: [0, 0],
    transitionDuration: 0,
    transitionEasing: TRANSITION.LINEAR,
    transitionInterruption: TRANSITION_EVENTS.BREAK,
  })

  constructor(options: GenshinMapOptions) {
    if (GenshinMap.instance)
      throw new Error('该类只允许单例运行')

    const { canvas, ...rest } = options

    super({
      ...rest,
      id: 'genshin-map',
      canvas,
      views: new OrthographicView({
        id: 'genshin-view',
      }),
      controller: {
        doubleClickZoom: false,
        scrollZoom: {
          speed: 0.002,
          smooth: true,
        },
        inertia: 300,
      },
      initialViewState: GenshinMap.getDefaultViewState(),
      getCursor: state => getCursor(this, state),
      getTooltip: info => getTooltip(this, info),
      onViewStateChange: (viewStateChangeParams) => {
        const newParams = handleViewStateChange(this, viewStateChangeParams)
        this.event.emit('viewStateChange', newParams)
        return newParams.viewState
      },
      onAfterRender: (...args) => this.event.emit('afterRender', ...args),
      onBeforeRender: (...args) => this.event.emit('beforeRender', ...args),
      onClick: (...args) => this.event.emit('click', ...args),
      onDrag: (...args) => this.event.emit('drag', ...args),
      onDragEnd: (...args) => this.event.emit('dragEnd', ...args),
      onDragStart: (...args) => this.event.emit('dragStart', ...args),
      onError: (...args) => this.event.emit('error', ...args),
      onHover: (...args) => this.event.emit('hover', ...args),
      onInteractionStateChange: (...args) => this.event.emit('interactionStateChange', ...args),
      onLoad: () => {
        this.#readResolve?.(this)
        this.event.emit('load', this)
      },
      onResize: (...args) => this.event.emit('resize', ...args),
      onWebGLInitialized: (...args) => this.event.emit('WebGLInitialized', ...args),
    })

    GenshinMap.instance = this
  }

  // ==================== 复用存储 ====================
  store = {
    condition: useCondition(),
    tile: useTileStore(),
    archive: useArchiveStore(),
    map: useMapStore(),
    overlay: useOverlayStore(),
    setting: useMapSettingStore(),
  }

  // ==================== 地图状态 ====================
  #eventBus = new EventBus<GenshinMapEvents>()
  get event() { return this.#eventBus }

  #readResolve?: (map: GenshinMap) => void = undefined
  readonly ready = new Promise<GenshinMap>((resolve) => {
    this.#readResolve = resolve
  })

  // ==================== 视口状态 ====================
  get mainViewState() { return this.#mainViewState.value }
  set mainViewState(v) {
    this.#mainViewState.value = v
  }

  #mainViewState = ref<GensinMapViewState>(GenshinMap.getDefaultViewState())

  startViewStateTransition = (cb: () => void) => {
    const cachedViewState = pick(this.mainViewState, 'transitionDuration', 'transitionEasing')
    cb()
    this.updateViewState(cachedViewState)
  }

  /**
   * 更新视图状态的方法
   * @note 不完善，不建议通过该方法传递 transition 相关参数
   * @fixme 必须先设置为空后再次设置才能生效
   */
  updateViewState = (viewState: Partial<GensinMapViewState>) => {
    const rewriteState = {
      ...this.mainViewState,
      ...viewState,
    }
    this.setProps({
      initialViewState: undefined,
    })
    this.setProps({
      initialViewState: rewriteState,
    })
    this.mainViewState = rewriteState
    this.baseLayer?.forceUpdate()
  }

  // ==================== 图层状态 ====================
  #baseLayer = shallowRef<GenshinBaseLayer>()
  get baseLayer() { return this.#baseLayer.value }

  /** 将点位坐标投影为地图坐标 */
  projectCoord = ([x, y]: API.Coordinate2D): API.Coordinate2D => {
    const [ox, oy] = this.baseLayer?.rawProps.center ?? [0, 0]
    return [x + ox, y + oy]
  }

  /** 将地图坐标投影为点位坐标 */
  unprojectCoord = ([x, y]: API.Coordinate2D): API.Coordinate2D => {
    const [ox, oy] = this.baseLayer?.rawProps.center ?? [0, 0]
    return [x - ox, y - oy]
  }

  static #unsubscribers: (() => void)[] = []

  getLayerConfigByAreaCode = (areaCode: string) => {
    const { mergedTileConfigs } = useTileStore()
    const currentTileConfig = mergedTileConfigs[areaCode]
    if (!currentTileConfig)
      throw new Error(`无法找到 "${areaCode}" 对应的图层配置`)
    return currentTileConfig
  }

  /**
   * 切换底图，传递 `undefined` 时清空底图。
   * 切换底图时会同时删除 `GenshinMarkerLayer`
   */
  setBaseLayerByAreaCode = (areaCode?: string) => {
    if (!areaCode) {
      this.setProps({ layers: [] })
      return
    }

    const currentTileConfig = this.getLayerConfigByAreaCode(areaCode)

    if (this.store.map.currentLayerCode !== currentTileConfig.tile.code) {
      const layer = new GenshinBaseLayer(currentTileConfig)
      GenshinMap.#unsubscribers.forEach(unsubscriber => unsubscriber())
      GenshinMap.#unsubscribers = [
        useMapSettingStore().$subscribe(layer.forceUpdate),
        useMapStore().$subscribe(layer.forceUpdate),
        useOverlayStore().$subscribe(layer.forceUpdate),
        useArchiveStore().$subscribe(layer.forceUpdate),
      ]
      this.setProps({ layers: [layer] })
      this.store.map.currentLayerCode = currentTileConfig.tile.code
      this.#baseLayer.value = layer
      this.store.condition.queryMarkers().then(layer.forceUpdate)
    }

    const { target, zoom } = currentTileConfig.initViewState
    this.updateViewState({
      target: this.projectCoord(target),
      zoom,
      transitionDuration: 200,
      transitionEasing: TRANSITION.EASE_OUT,
    })
  }
}
