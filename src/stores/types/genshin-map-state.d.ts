import type { OrbitViewState } from '@deck.gl/core/typed'

declare namespace GSMapState {
  /** 地图视口状态 */
  interface ViewState extends Omit<OrbitViewState, 'target'> {
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
    }
  }

  /** 交互类型表 */
  interface InteractionTypeMap {
    defaultMarker: MarkerWithRenderConfig
  }

  /** 混合交互类型 */
  type InteractionInfo = MapToSchema<InteractionTypeMap>

  /** 任务类型表 */
  interface MissionTypeMap {
    markerDragging: Record<number, API.Coordinate2D>
  }

  /** 混合任务类型 */
  type Mission = MapToSchema<MissionTypeMap>
}
