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
