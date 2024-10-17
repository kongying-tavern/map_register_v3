import type { DeckProps, OrthographicView, OrthographicViewState } from '@deck.gl/core'
import type { ControllerOptions } from 'node_modules/@deck.gl/core/dist/controllers/controller'
import type { IconLayerProps } from '@deck.gl/layers'
import type { AreaTagTuple } from '@/configs'

type OrthographicViewMapProps = DeckProps<OrthographicView>

// ============================== Map ==============================
export interface GenshinMapProps extends Omit<OrthographicViewMapProps, 'canvas'> {
  controller?: ControllerOptions & {
    scrollZoom?: {
      speed?: number
      smooth?: boolean
      transitionDuration?: number | (() => number)
    }
  }
}

// ============================== Layer ==============================
export interface GenshinMapViewState extends OrthographicViewState {
  target: [number, number]
  zoom: number
  minZoom?: number
  maxZoom?: number
}

export interface GSTileLayerProps {
  /** 底图标识 */
  code: string

  /** 图层尺寸 */
  size: [w: number, h: number]

  /**
   * 底图图片拓展名
   * @default 'png'
   */
  extension?: string

  /** 图元偏移量 */
  tilesOffset?: [x: number, y: number]
}

export interface GSTagLayerProps {
  /** 标签组 */
  tagGroups?: AreaTagTuple[][]

  /** 是否显示全部标签 */
  visible?: boolean

  /** 坐标偏移量 */
  offset?: [x: number, y: number]
}

export interface GSMarkerLayerProps {
  data: GSMarkerInfo[]
  iconAtlas: IconLayerProps['iconAtlas']
  iconMapping: Required<IconLayerProps>['iconMapping']
  archiveHash: string
  markedIds: Set<number>
  transparentMarked: boolean
  draggingMap: Record<number, API.Coordinate2D>
  draggingHash: string
  interactHash: string
  getHover: (id: number) => boolean
  getFocus: (id: number) => boolean
  getMarked: (id: number) => boolean
}

// ============================== Marker ==============================
export interface GSMarkerInfo extends API.MarkerVo {
  /** 是否为快照 */
  __gs_isSnapshot?: boolean

  /** 用于渲染的附加属性，避免在渲染层进行计算 */
  render: {
    /** 点位坐标 */
    position: API.Coordinate2D

    /** 点位地区 */
    area: API.AreaVo

    /** 点位所属的底图 */
    tileCode: string

    /** 被渲染为主图标的物品 id */
    mainItemId: number

    /** 主图标 tag */
    mainIconTag: string

    /** 副图标 tag 列表 */
    restIconTags: string[]

    /** 副图标 id 列表 */
    restItemIds: number[]

    /** 是否为分层层级图标 */
    isUnderground: boolean

    /** 是否为临时点位 */
    isTemporary: boolean
  }
}
