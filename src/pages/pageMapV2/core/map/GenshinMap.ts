import { Deck, OrthographicController, OrthographicView } from '@deck.gl/core'
import { GSCompositeLayer } from '../layer'
import { useMapStateStore } from '@/stores'
import type { GSMap } from '@/pages/pageMapV2/types/map'

export class GenshinMap extends Deck<OrthographicView> {
  static create = (options: GSMap.ConstructorOptions) => {
    return new this(options)
  }

  static readonly ID = {
    main: 'map-view',
    // TODO 小地图视口暂未实现
    minimap: 'minimap-view',
  }

  constructor(options: GSMap.ConstructorOptions) {
    const {
      canvas,
      zoomTransitionDuration,
      ...rest
    } = options

    const mapStateStore = useMapStateStore()

    const {
      maxZoom,
      minZoom,
      zoom,
      target,
      transitionDuration,
      transitionEasing,
      transitionInterruption,
    } = mapStateStore.viewState

    const ViewController = class extends OrthographicController {
      protected override _onWheel(...[event]: Parameters<OrthographicController['_onWheel']>): boolean {
        if (!this.scrollZoom)
          return false

        const pos = this.getCenter(event)
        if (!this.isPointInBounds(pos, event))
          return false
        event.srcEvent.preventDefault()

        const { speed = 0.01, smooth = false } = this.scrollZoom === true ? {} : this.scrollZoom
        const { delta } = event

        let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)))
        if (delta < 0 && scale !== 0)
          scale = 1 / scale

        const newControllerState = this.controllerState.zoom({ pos, scale })
        const transitionDuration = smooth ? (zoomTransitionDuration?.() ?? 200) : 0
        this.updateViewport(
          newControllerState,
          { ...this._getTransitionProps({ around: pos }), transitionDuration },
          { isZooming: true, isPanning: true },
        )
        return true
      }
    }

    const mainView = new OrthographicView({
      id: GenshinMap.ID.main,
      controller: {
        doubleClickZoom: false,
        scrollZoom: {
          speed: 0.002,
          smooth: true,
        },
        inertia: 500,
        type: ViewController,
      },
    })

    super({
      ...rest,
      id: 'genshin-map',
      canvas,
      views: mainView,
      layers: [new GSCompositeLayer()],
      initialViewState: {
        maxZoom,
        minZoom,
        zoom,
        target,
        transitionDuration,
        transitionEasing,
        transitionInterruption,
      },
      getCursor: ({ isDragging, isHovering }) => {
        return mapStateStore.cursor !== undefined
          ? mapStateStore.cursor
          : isDragging
            ? 'grabbing'
            : isHovering
              ? 'pointer'
              : 'inherit'
      },
      onViewStateChange: (params) => {
        if (mapStateStore.isViewPortLocked)
          return params.oldViewState
        const { viewState: { maxZoom: _, minZoom: __, ...rest } } = params
        const { maxZoom, minZoom } = mapStateStore.viewState
        Object.assign(params.viewState, { ...rest, maxZoom, minZoom })
        mapStateStore.event.emit('viewStateChange', params)
        return params.viewState
      },
      onHover: (...args) => {
        mapStateStore.event.emit('hover', ...args)
      },
      onClick: (...args) => {
        const [info] = args
        // 转发一次无 sourceLayer 的点击事件以便子图层进行诸如 removeFocus 等操作
        if (!info.sourceLayer)
          this.layerManager?.layers.forEach(layer => layer.props.onClick?.(...args))
        mapStateStore.event.emit('click', ...args)
      },
      onDrag: (...args) => {
        mapStateStore.event.emit('drag', ...args)
      },
      onDragStart: (...args) => {
        mapStateStore.event.emit('dragStart', ...args)
      },
      onLoad: () => {
        mapStateStore.event.emit('load', this)
      },
    })

    this.ready = new Promise<GenshinMap>((resolve) => {
      mapStateStore.event.once('load', resolve)
    })

    mapStateStore.event.on('setViewState', this.setViewState)

    this.#mapStateStore = mapStateStore
  }

  finalize = () => {
    this.#mapStateStore.event.off('setViewState', this.setViewState)
    super.finalize()
  }

  #mapStateStore: ReturnType<typeof useMapStateStore>

  readonly ready: Promise<GenshinMap>

  setViewState = (...[state]: GSMap.EventMap['setViewState']) => {
    const mergedState = Object.assign({}, this.#mapStateStore.viewState, state)
    this.setProps({
      initialViewState: mergedState,
    })
    this.#mapStateStore.setViewState(mergedState)
  }
}
