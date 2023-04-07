import type { DeckProps, LayersList, OrbitViewState, PickingInfo } from '@deck.gl/core/typed'
import { Deck, OrthographicView, TRANSITION_EVENTS } from '@deck.gl/core/typed'
import type { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller'
import { EventBus, GenshinBaseLayer } from '.'
import db from '@/database'

export interface GenshinMapOptions extends DeckProps {
  canvas: HTMLCanvasElement
}

export interface GensinMapViewState extends OrbitViewState {
  minZoom: number
  maxZoom: number
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
export type Coordinate3D = [number, number, number]

export class GenshinMap extends Deck {
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
      getCursor: state => state.isDragging ? 'grabbing' : state.isHovering ? 'pointer' : 'crosshair',
      onViewStateChange: ({ viewState, oldViewState = {}, ...rest }) => {
        const newState = viewState as GensinMapViewState
        const oldState = oldViewState as Partial<GensinMapViewState>
        const rewriteState: GensinMapViewState = {
          ...newState,
          transitionDuration: newState.zoom === oldState.zoom ? 0 : 200,
          transitionInterruption: TRANSITION_EVENTS.BREAK,
          transitionEasing: (t: number) => Math.sin(t * Math.PI / 2), // 即 ease-out 效果
        }
        this.event.emit('viewStateChange', { viewState: rewriteState, oldViewState: oldState, ...rest })
        return rewriteState
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

    this.event.on('viewStateChange', ({ viewState }) => {
      this.baseLayer?.forceUpdate()
      this.#mainViewState.value = viewState
    })
  }

  #eventBus = new EventBus<GenshinMapEvents>()
  get event() { return this.#eventBus }

  get mainViewState() { return this.#mainViewState.value }
  #mainViewState = ref<GensinMapViewState>({
    zoom: -4,
    minZoom: -4,
    maxZoom: 2,
    target: [0, 0, 0],
  })

  #baseLayerCode = ref<string>()
  get baseLayerCode() { return this.#baseLayerCode.value }

  #baseLayer = shallowRef<GenshinBaseLayer>()
  get baseLayer() { return this.#baseLayer.value }

  #showTag = ref(true)
  get showTag() { return this.#showTag.value }
  set showTag(v) {
    this.#showTag.value = v
    this.baseLayer?.forceUpdate()
  }

  #showBorder = ref(true)
  get showBorder() { return this.#showBorder.value }
  set showBorder(v) {
    this.#showBorder.value = v
    this.baseLayer?.forceUpdate()
  }

  #showTooltip = ref(true)
  get showTooltip() { return this.#showTooltip.value }
  set showTooltip(v) { this.#showTooltip.value = v }

  #readResolve?: (map: GenshinMap) => void = undefined
  readonly ready = new Promise<GenshinMap>((resolve) => {
    this.#readResolve = resolve
  })

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

    const getInitialTarget = (): Coordinate3D => {
      const target = layer?.rawProps?.initViewState.target
      return target
        ? [target[0] + center[0], target[1] + center[1], 0]
        : [(size[0] / 2 - tilesOffset[0]), (size[1] / 2 - tilesOffset[1]), 0]
    }

    const initialViewState = {
      maxZoom: layer?.rawProps.initViewState.maxZoom ?? this.mainViewState.maxZoom,
      minZoom: layer?.rawProps.initViewState.minZoom ?? this.mainViewState.minZoom,
      zoom: layer?.rawProps.initViewState.zoom ?? this.mainViewState.zoom,
      target: getInitialTarget(),
    } as GensinMapViewState
    this.#mainViewState.value = initialViewState

    const getTooltip = (info: PickingInfo) => {
      if (!this.showTooltip || !info.coordinate)
        return null
      const [x, y] = info.coordinate
      return `x: ${Math.floor(x) - center[0]}, y: ${Math.floor(y) - center[1]}
      zoom: ${info.viewport?.zoom?.toFixed(2)}`
    }

    this.setProps({
      layers,
      getTooltip,
      initialViewState,
    })
    this.#baseLayer.value = layer
  }

  setBaseLayer = (code?: string) => {
    this.#baseLayerCode.value = code
    this.#setBaseLayer(GenshinBaseLayer.getLayer(code))
  }

  #markers = shallowRef<API.MarkerVo[]>([])
  get markers() { return this.#markers.value }

  /** itemId 与 iconUrl 对应的表 */
  #iconMap = ref<Map<number, string>>(new Map())
  get iconMap() { return this.#iconMap.value }

  initIconMap = async (markers: API.MarkerVo[]) => {
    for (const marker of markers) {
      for (const item of marker.itemList ?? []) {
        if (this.iconMap.has(item.itemId as number))
          continue
        const iconTag = (await db.item.get(item.itemId as number))?.iconTag
        if (!iconTag)
          continue
        const iconUrl = (await db.iconTag.where('tag').equals(iconTag).first())?.url
        iconUrl && this.iconMap.set(item.itemId as number, iconUrl)
      }
    }
  }

  renderMarkers = async (markers: API.MarkerVo[]) => {
    await this.initIconMap(markers)
    this.#markers.value = markers
    this.baseLayer?.forceUpdate()
  }
}
