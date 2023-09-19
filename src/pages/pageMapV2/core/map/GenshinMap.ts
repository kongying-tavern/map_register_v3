import type { DeckProps, OrbitViewState } from '@deck.gl/core/typed'
import { Deck, OrthographicView, TRANSITION_EVENTS } from '@deck.gl/core/typed'
import type { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller'
import { clamp } from 'lodash'
import { MAP_FONTFAMILY, TRANSITION } from '../../shared'
import { EventBus, GenshinBaseLayer } from '..'
import { getCursor, getTooltip } from '.'
import genshinFont from '@/style/fonts/genshinFont.woff2?url'
import { useArchiveStore, useMapSettingStore, useMapStore, useOverlayStore, useUserStore } from '@/stores'

export interface GenshinMapOptions extends DeckProps {
  canvas: HTMLCanvasElement
}

export interface GensinMapViewState extends Omit<OrbitViewState, 'target'> {
  minZoom: number
  maxZoom: number
  target: API.Coordinate2D
}

export interface GenshinViewStateChangeParameters extends ViewStateChangeParameters {
  viewState: GensinMapViewState
  oldViewState: Partial<GensinMapViewState>
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

  constructor(options: GenshinMapOptions) {
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
      getCursor: state => getCursor(this, state),
      getTooltip: info => getTooltip(this, info),
      onViewStateChange: (viewStateChangeParams) => {
        const newParams = this.#handleViewStateChange(viewStateChangeParams)
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
  }

  // ==================== 复用存储 ====================
  store = {
    archive: useArchiveStore(),
    map: useMapStore(),
    overlay: useOverlayStore(),
    setting: useMapSettingStore(),
    user: useUserStore(),
  }

  // ==================== 地图状态 ====================
  #eventBus = new EventBus<GenshinMapEvents>()
  get event() { return this.#eventBus }

  #handleViewStateChange = ({ viewState, oldViewState = {}, interactionState, ...rest }: ViewStateChangeParameters) => {
    const newState = viewState as GensinMapViewState
    const oldState = oldViewState as Partial<GensinMapViewState>

    if (this.store.map.lockViewState)
      return { viewState: oldState, oldViewState: oldState, interactionState, ...rest }

    const rewriteTarget = ((): API.Coordinate2D => {
      if (!this.baseLayer)
        return newState.target
      const [xmin, ymax, xmax, ymin] = this.baseLayer.rawProps.bounds
      return [clamp(newState.target[0], xmin, xmax), clamp(newState.target[1], ymin, ymax)]
    })()

    const rewriteState: GensinMapViewState = {
      ...newState,
      target: rewriteTarget,
      ...(interactionState.isZooming
        ? {
            transitionDuration: 32,
            transitionEasing: TRANSITION.LINEAR,
          }
        : {}),
    }

    this.mainViewState = rewriteState
    interactionState.isZooming && this.baseLayer?.forceUpdate()

    return { viewState: rewriteState, oldViewState: oldState, interactionState, ...rest }
  }

  #readResolve?: (map: GenshinMap) => void = undefined
  readonly ready = new Promise<GenshinMap>((resolve) => {
    this.#readResolve = resolve
  })

  // ==================== 视口状态 ====================
  get mainViewState() { return this.#mainViewState.value }
  set mainViewState(v) {
    this.#mainViewState.value = v
  }

  #mainViewState = ref<GensinMapViewState>({
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

  updateViewState = (viewState: Partial<GensinMapViewState>) => {
    // FIXME 2023-08-06: 这里必须先设置为空后再次设置才能生效，或许使用方法不对
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
    rewriteState.zoom !== this.mainViewState.zoom && this.baseLayer?.forceUpdate()
    this.mainViewState = rewriteState
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

  /**
   * 切换底图，传递 `undefined` 时清空底图。
   * 切换底图时会同时删除 `GenshinMarkerLayer`
   */
  #setBaseLayer = async (layer?: GenshinBaseLayer) => {
    await this.ready
    if (!layer || !this.layerManager || layer === this.#baseLayer.value)
      return

    const { center = [0, 0], size = [0, 0], tilesOffset = [0, 0] } = layer.rawProps ?? {}

    const getInitialTarget = (): API.Coordinate2D => {
      const target = layer.rawProps.initViewState.target
      return target
        ? [target[0] + center[0], target[1] + center[1]]
        : [(size[0] / 2 - tilesOffset[0]), (size[1] / 2 - tilesOffset[1])]
    }

    const initialViewState = {
      ...this.mainViewState,
      maxZoom: layer.rawProps.initViewState.maxZoom ?? this.mainViewState.maxZoom,
      minZoom: layer.rawProps.initViewState.minZoom ?? this.mainViewState.minZoom,
      zoom: layer.rawProps.initViewState.zoom ?? this.mainViewState.zoom,
      target: getInitialTarget(),
    } as GensinMapViewState

    this.setProps({
      layers: [layer],
      initialViewState,
    })
    this.#baseLayer.value = layer
    this.#mainViewState.value = initialViewState
    this.baseLayer?.forceUpdate()
  }

  setBaseLayer = (code = '') => {
    if (this.baseLayer?.rawProps.code === code)
      return
    this.store.map.currentLayerCode = code
    this.#setBaseLayer(GenshinBaseLayer.getLayer(code))
  }
}
