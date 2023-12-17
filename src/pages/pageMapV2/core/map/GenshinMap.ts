import type { DeckProps } from '@deck.gl/core/typed'
import { Deck, OrthographicView } from '@deck.gl/core/typed'
import { MAP_FONTFAMILY, TRANSITION } from '../../shared'
import { EventBus } from '..'
import { GSCompositeLayer } from '../layer'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import genshinFont from '@/style/fonts/genshinFont.woff2?url'
import { useMapStateStore } from '@/stores'

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
  load: [map: GenshinMap]
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

    const mapStateStore = useMapStateStore()

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
        inertia: 500,
      },
      layers: [new GSCompositeLayer()],
      viewState: mapStateStore.viewState,
      getCursor: ({ isDragging, isHovering }) => {
        return isDragging ? 'grabbing' : isHovering ? 'pointer' : 'inherit'
      },
      onViewStateChange: ({ viewState, interactionState: { isZooming } }) => {
        if (mapStateStore.isViewPortLocked)
          return
        if (isZooming && viewState.transitionDuration > 0) {
          viewState.transitionEasing = TRANSITION.LINEAR
          viewState.transitionDuration = 32
        }
        mapStateStore.setViewState(viewState)
        this.setProps({ viewState })
      },
      onClick: (info, event) => {
        if (!info.object) {
          mapStateStore.setInteractionInfo('focus', null)
          mapStateStore.setInteractionInfo('hover', null)
        }
        this.#event.emit('click', info, event)
      },
      onDrag: (...args) => this.#event.emit('drag', ...args),
      onDragEnd: (...args) => this.#event.emit('dragEnd', ...args),
      onDragStart: (...args) => this.#event.emit('dragStart', ...args),
      onError: (...args) => this.#event.emit('error', ...args),
      onHover: (...args) => this.#event.emit('hover', ...args),
      onLoad: () => this.#event.emit('load', this),
    })

    this.ready = new Promise<GenshinMap>(resolve => this.addEventListener('load', resolve))
  }

  // ==================== 地图状态 ====================
  #event = new EventBus<GenshinMapEvents>()

  readonly addEventListener = this.#event.on

  readonly removeEventListener = this.#event.off

  readonly ready: Promise<GenshinMap>

  /** 更新视图状态的方法 */
  updateViewState = async (partialViewState: Partial<GSMapState.ViewState>) => {
    const oldViewState = this.viewManager?.controllers['genshin-view']?.controllerState._viewportProps
    const viewState = {
      ...oldViewState,
      ...partialViewState,
    }
    this.props.onViewStateChange({
      viewId: 'genshin-view',
      viewState,
      oldViewState,
      interactionState: {
        isZooming: viewState.zoom !== oldViewState.zoom,
        isDragging: false,
        isPanning: false,
        isRotating: false,
        inTransition: false,
      },
    })
    this.setProps({ viewState })
  }
}
