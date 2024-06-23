import type { OrthographicViewState } from '@deck.gl/core'
import type { LinkActionEnum } from '@/shared'

declare namespace GSMapState {
  /** 地图视口状态 */
  interface ViewState extends Omit<OrthographicViewState, 'target'> {
    zoom: number
    minZoom: number
    maxZoom: number
    target: API.Coordinate2D
  }

  /** 附加了渲染信息的点位对象 */
  interface MarkerWithRenderConfig extends API.MarkerVo {
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

      /** 是否为地下图标 */
      isUnderground: boolean

      /** 是否为临时点位 */
      isTemporary: boolean
    }
  }

  /** 点位关联 - 渲染单位 */
  interface MLRenderUnit {
    /** 关联唯一标识 */
    key: string
    /** 源点位 id */
    source: number
    /** 目标点位 id */
    target: number
    /** 关联类型标识 */
    type: LinkActionEnum
  }

  /** 交互类型表 */
  interface InteractionTypeMap {
    defaultMarker: MarkerWithRenderConfig
    defaultMarkerLink: MLRenderUnit
    multipleMarkers: Set<number>
    overlayChunks: Set<string>
    unknown: unknown
  }

  /** 混合交互类型 */
  type InteractionInfo = MapToSchema<InteractionTypeMap>

  /** 任务类型表 */
  interface MissionTypeMap {
    markerDragging: Record<number, API.Coordinate2D>
    markerLink: API.MarkerLinkageVo[]
    markerMultiSelect: boolean
    unknown: unknown
  }

  /** 混合任务类型 */
  type Mission = MapToSchema<MissionTypeMap>

  /**
   * 临时点位类型表
   * @note value 只能为 `API.MarkerVo` 或 `MarkerWithRenderConfig`
   */
  interface TempMarkerTypeMap {
    focus: MarkerWithRenderConfig[]
    markerLink: API.MarkerVo[]
    markerMultiSelect: MarkerWithRenderConfig[]
    markerDragging: MarkerWithRenderConfig[]
  }

  /** 临时点位类型 */
  type TempMarkerType = keyof TempMarkerTypeMap

  /** 地图可用事件与其参数数组 */
  interface CustomEventTypeMap {
    unknown: unknown[]
  }
}
