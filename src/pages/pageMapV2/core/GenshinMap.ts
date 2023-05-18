import type { DeckProps, LayersList, OrbitViewState, PickingInfo } from '@deck.gl/core/typed'
import { Deck, OrthographicView, TRANSITION_EVENTS } from '@deck.gl/core/typed'
import type { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller'
import { clamp } from 'lodash'
import { MAP_FONTFAMILY } from '../shared'
import type { GenshinMapState } from '../hooks'
import { getDefaultMapState } from '../hooks'
import { EventBus, GenshinBaseLayer, StateManager } from '.'
import genshinFont from '@/style/fonts/genshinFont.woff2?url'

export interface GenshinMapOptions extends DeckProps {
  canvas: HTMLCanvasElement
}

export interface GensinMapViewState extends Omit<OrbitViewState, 'target'> {
  minZoom: number
  maxZoom: number
  target: Coordinate2D
}

export interface GenshinViewStateChangeParameters extends ViewStateChangeParameters {
  viewState: GensinMapViewState
  oldViewState: Partial<GensinMapViewState>
}

type ExtractParamters<T extends keyof DeckProps> = Parameters<NonNullable<DeckProps[T]>>

export interface GenshinMapEvents extends Record<string, unknown[]> {
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
  viewStateChange: [GenshinViewStateChangeParameters]
  WebGLInitialized: ExtractParamters<'onWebGLInitialized'>
}

export type Coordinate2D = [number, number]

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
      views: new OrthographicView({ id: 'genshin-view' }),
      controller: {
        doubleClickZoom: false,
        scrollZoom: {
          speed: 0.01,
          smooth: true,
        },
      },
      getCursor: state => state.isDragging
        ? 'grabbing'
        : (state.isHovering && this.stateManager.get('hover'))
            ? 'pointer'
            : 'crosshair',
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

  // ==================== 地图状态 ====================
  #eventBus = new EventBus<GenshinMapEvents>()
  get event() { return this.#eventBus }

  get stateManager() { return this.#stateManager }
  #stateManager = new StateManager<GenshinMap, GenshinMapState>(this, getDefaultMapState())

  #handleViewStateChange = ({ viewState, oldViewState = {}, ...rest }: ViewStateChangeParameters & { viewId: string }) => {
    const newState = viewState as GensinMapViewState
    const oldState = oldViewState as Partial<GensinMapViewState>
    if (!this.baseLayer)
      return { viewState: newState, oldViewState: oldState, ...rest }
    const [xmin, ymax, xmax, ymin] = this.baseLayer.rawProps.bounds
    const rewriteState: GensinMapViewState = {
      ...newState,
      target: [
        clamp(newState.target[0], xmin, xmax),
        clamp(newState.target[1], ymin, ymax),
      ],
      transitionDuration: newState.zoom === oldState.zoom ? 0 : 200,
      transitionInterruption: TRANSITION_EVENTS.BREAK,
      transitionEasing: (t: number) => Math.sin(t * Math.PI / 2), // 即 ease-out 效果
    }
    this.#mainViewState.value = rewriteState
    this.baseLayer?.forceUpdate()
    return { viewState: rewriteState, oldViewState: oldState, ...rest }
  }

  #readResolve?: (map: GenshinMap) => void = undefined
  readonly ready = new Promise<GenshinMap>((resolve) => {
    this.#readResolve = resolve
  })

  // ==================== 视口状态 ====================
  get mainViewState() { return this.#mainViewState.value }
  #mainViewState = ref<GensinMapViewState>({
    zoom: -4,
    minZoom: -4,
    maxZoom: 2,
    target: [0, 0],
  })

  // ==================== 图层状态 ====================
  #baseLayer = shallowRef<GenshinBaseLayer>()
  get baseLayer() { return this.#baseLayer.value }

  /**
   * 切换底图，传递 `undefined` 时清空底图。
   * 切换底图时会同时删除 `GenshinMarkerLayer`
   */
  #setBaseLayer = async (layer?: GenshinBaseLayer) => {
    await this.ready
    if (!this.layerManager || layer === this.#baseLayer.value)
      return

    const { center = [0, 0], size = [0, 0], tilesOffset = [0, 0] } = layer?.rawProps ?? {}
    const layers: LayersList = layer ? [layer] : []

    const getInitialTarget = (): Coordinate2D => {
      const target = layer?.rawProps?.initViewState.target
      return target
        ? [target[0] + center[0], target[1] + center[1]]
        : [(size[0] / 2 - tilesOffset[0]), (size[1] / 2 - tilesOffset[1])]
    }

    const initialViewState = {
      maxZoom: layer?.rawProps.initViewState.maxZoom ?? this.mainViewState.maxZoom,
      minZoom: layer?.rawProps.initViewState.minZoom ?? this.mainViewState.minZoom,
      zoom: layer?.rawProps.initViewState.zoom ?? this.mainViewState.zoom,
      target: getInitialTarget(),
    } as GensinMapViewState
    this.#mainViewState.value = initialViewState

    const getTooltip = (info: PickingInfo) => {
      const { hover } = this.stateManager.state
      if (hover !== info.object)
        this.stateManager.state.hover = info.object
      if (!this.stateManager.get('showTooltip') || !info.coordinate)
        return null
      const [x, y] = info.coordinate
      const renderText = info.object
        ? `markerTitle: ${info.object?.markerTitle}
          markerId: ${info.object?.id}
          hiddenFlag: ${info.object?.hiddenFlag}
          picture: ${info.object?.picture}
          version: ${info.object?.version}
          position: [${info.object?.position}]
          itemIdList: [${info.object?.itemIdList?.join(',')}]
          extra: ${info.object?.extra}`
        : info.sourceLayer
          ? `id: ${info.sourceLayer.id}
            x: ${Math.floor(x) - center[0]}, y: ${Math.floor(y) - center[1]}
            zoom: ${info.viewport?.zoom?.toFixed(2)}`
          : '前面的区域，以后再来探索吧！'
      return renderText
    }

    this.setProps({
      layers,
      getTooltip,
      initialViewState,
    })
    this.#baseLayer.value = layer
  }

  setBaseLayer = (code?: string) => {
    if (this.baseLayer?.rawProps.code === code)
      return
    this.#setBaseLayer(GenshinBaseLayer.getLayer(code))
  }
}
