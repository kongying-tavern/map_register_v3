import type { DeckProps, OrthographicView, OrthographicViewState } from '@deck.gl/core'
import type { ControllerOptions } from 'node_modules/@deck.gl/core/dist/controllers/controller'
import type { IconLayerProps } from '@deck.gl/layers'
import type { AreaTagTuple } from '@/configs'

type OrthographicViewMapProps = DeckProps<OrthographicView>
export type Coordinate2D = [x: number, y: number]

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
  tilesOffset?: Coordinate2D
}

export interface GSTagLayerProps {
  /** 标签组 */
  tagGroups?: AreaTagTuple[][]

  /** 是否显示全部标签 */
  visible?: boolean

  /** 坐标偏移量 */
  offset?: Coordinate2D
}

export interface GSOverlayerProps {
  /** 地图尺寸，用于设置 overlay 的 mask */
  bounds: [xmin: number, ymin: number, xmax: number, ymax: number]
  showOverlayMask?: boolean
  chunkMap: Map<string, OverlayChunk>
  normalChunks: string[]
  tileLikeChunks: string[]
  pickable?: boolean
}

export interface GSMarkerLayerProps {
  data: GSMarkerInfo[]
  iconAtlas: IconLayerProps['iconAtlas']
  iconMapping: Required<IconLayerProps>['iconMapping']
  transparentMarked: boolean
  hoverMarkerIds?: Set<number>
  focusMarkerIds?: Set<number>
  markedMarkerIds?: Set<number>
  rewritePositions?: Map<number, Coordinate2D>
}

export interface ArrowShapeOptions {
  /** 箭体长度 @default 70 */
  arrowBodyLength?: number
  /** 箭体半径 @default 2 */
  arrowBodyRadius?: number
  /** 箭间距 @default 10 */
  arrowGap?: number
  /** 箭头半径 @default 10 */
  arrowHeadRadius?: number
  /** 箭头厚度 @default Math.SQRT2 * 4 */
  arrowHeadWeight?: number
  /** 箭头翼角（弧度） @default 0.75 * Math.PI */
  arrowWingAngle?: number
}

export interface GSLinkLayerProps extends ArrowShapeOptions {
  /** 关联数据 */
  data: {
    /** 关联连线的唯一 id */
    id: string
    /** 起始点 */
    from: Coordinate2D
    /** 终止点 */
    to: Coordinate2D
    /** 指示线（箭）的颜色 */
    color: [r: number, g: number, b: number]
  }[]
  /** 指示线的透明度 0-255 */
  colorOpacity?: number
  /** 描边宽度 */
  outlineWidth?: number
  /** 描边颜色 */
  outlineColor?: [r: number, g: number, b: number] | [r: number, g: number, b: number, a: number]
  /** hover 数据 */
  hoverIds?: Set<string>
  /** 缩放系数（不影响长度尺寸） */
  scale?: number
}

// ============================== Marker ==============================
export interface GSMarkerInfo extends API.MarkerVo {
  /** 是否为快照 */
  __gs_isSnapshot?: boolean

  /** 用于渲染的附加属性，避免在渲染层进行计算 */
  render: {
    /** 点位坐标 */
    position: Coordinate2D

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

/** 点位关联 - 渲染单位 */
export interface MLRenderUnit {
  /** 关联唯一标识 */
  key: string
  /** 源点位 id */
  source: number
  /** 目标点位 id */
  target: number
  /** 关联类型标识 */
  type: string
}

export interface MarkerLinkMission extends API.MarkerLinkageVo {
  meta: {
    key: string
  }
}

/** 任务类型表 */
export interface MissionTypeMap {
  markerDragging: Map<number, Coordinate2D>
  markerLink: MarkerLinkMission[]
  markerMultiSelect: boolean
  markerBulkState: boolean
  unknown: unknown
}

/** 混合任务类型 */
export type Mission = MapToSchema<MissionTypeMap>

/**
 * 临时点位类型表
 * @note value 只能为 `API.MarkerVo` 或 `MarkerWithRenderConfig`
 */
export interface TempMarkerTypeMap {
  focus: GSMarkerInfo[]
  markerLink: API.MarkerVo[]
  markerMultiSelect: GSMarkerInfo[]
  markerDragging: GSMarkerInfo[]
}

/** 临时点位类型 */
export type TempMarkerType = keyof TempMarkerTypeMap

/** 地图可用事件与其参数数组 */
export interface CustomEventTypeMap {
  unknown: unknown[]
}

// ============================== overlay ==============================

export interface OverlayGroup {
  id: string
  label?: API.OverlayGroupOption['label']
  value?: API.OverlayGroupOption['value']
  multiple: API.OverlayConfig['multiple']
  mask: API.OverlayConfig['overlayMask']
  url?: API.OverlayGroupOption['url']
  urlTemplate?: API.OverlayGroupOption['urlTemplate']
  bounds?: API.OverlayBounds
  items: API.OverlayOption[]
  role: API.OverlayRole
}

export interface OverlayUnit {
  id: string
  label?: string
  value?: string
  url?: API.OverlayOption['url']
  urlTemplate?: API.OverlayOption['urlTemplate']
  bounds?: API.OverlayBounds
}

export interface OverlayChunk {
  /** config 自身的唯一 id */
  id: string
  /** overlay 名称 */
  label: string
  /** overlay 所属的分组 */
  group: OverlayChunkGroup
  /** chunk 所属的单元 */
  item: {
    id: string
    name: string
  }
  /**
   * overlay 所属的地区代码
   * @note 一个层级可能存在于多个地区，所以使用 Set 类型进行存储
   */
  areaCodes: Set<string>
  /** overlay 图片地址 */
  url: string
  /** overlay 区域 */
  bounds: API.OverlayBounds
}

export interface OverlayChunkGroup {
  id: string
  name: string
  mask: boolean
  role: API.OverlayRole
  multiple: boolean
  areaCodes: Set<string>
  areaIndexes: Map<string, number>
}

export interface OverlayControlGroup extends OverlayChunkGroup {
  bounds: API.OverlayBounds
  items: { id: string; name: string }[]
}

export interface MergedOverlayGroups {
  [areaCode: string]: OverlayGroup[]
}

// ============================== event ==============================

export interface GSEventMap {
  setViewState: [state: Partial<GenshinMapViewState>]
}
