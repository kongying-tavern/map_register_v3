import { Deck, OrthographicView } from '@deck.gl/core/typed'
import { GSMapController } from '../controllers'
import { GSCompositeLayer } from '../layer'
import { loadFonts } from '../utils'
import { EventBus } from '@/utils'
import { useMapStateStore } from '@/stores'
import type { GSMap } from '@/pages/pageMapV2/types/map'

export class GenshinMap extends Deck {
  static create = async (options: GSMap.ConstructorOptions) => {
    await loadFonts()
    return new this(options)
  }

  static readonly ID = {
    main: 'map-view',
    // TODO 小地图视口暂未实现
    minimap: 'minimap-view',
  }

  constructor(options: GSMap.ConstructorOptions) {
    const { canvas, ...rest } = options

    const mapStateStore = useMapStateStore()

    super({
      ...rest,
      id: 'genshin-map',
      canvas,
      views: new OrthographicView({
        id: GenshinMap.ID.main,
        controller: {
          doubleClickZoom: false,
          scrollZoom: {
            speed: 0.002,
            smooth: true,
          },
          inertia: 500,
          type: GSMapController,
        },
      }),
      layers: [new GSCompositeLayer()],
      initialViewState: mapStateStore.viewState,
      getCursor: ({ isDragging, isHovering }) => {
        return isDragging ? 'grabbing' : isHovering ? 'pointer' : 'inherit'
      },
      onViewStateChange: ({ viewState, oldViewState }) => {
        if (mapStateStore.isViewPortLocked)
          return oldViewState
        // TODO 由于使用 initialViewState 作为视口状态，
        // 导致 map 的视口状态由 view 自行管理，
        // 因此需要 hack 部分不受控的属性，比如 minZoom、maxZoom。
        for (const key in viewState) {
          if (typeof viewState[key] !== 'number')
            continue
          if (Number.isFinite(viewState[key]))
            continue
          viewState[key] = mapStateStore.viewState[key as keyof typeof mapStateStore.viewState]
        }
        mapStateStore.setViewState(viewState)
        return viewState
      },
      onClick: (info, event) => {
        if (!info.object) {
          mapStateStore.setInteractionInfo('focus', null)
          mapStateStore.setInteractionInfo('hover', null)
        }
        this.#event.emit('click', info, event)
      },
      onLoad: () => {
        this.#event.emit('load', this)
      },
    })

    this.ready = new Promise<GenshinMap>(resolve => this.addEventListener('load', resolve))

    this.setProps = (...[props]: Parameters<Deck['setProps']>) => {
      if (props.viewState) {
        props.viewState = {
          ...mapStateStore.viewState,
          ...props.viewState,
        }
      }
      super.setProps(props)
    }
  }

  #event = new EventBus<GSMap.EventMap>()

  readonly ready: Promise<GenshinMap>

  readonly addEventListener = this.#event.on

  readonly removeEventListener = this.#event.off

  readonly getViewController = () => {
    return this.viewManager?.controllers[GenshinMap.ID.main] as GSMapController | undefined
  }

  readonly getViewManage = () => {
    return this.viewManager
  }
}
