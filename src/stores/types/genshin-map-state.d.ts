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

      /** 是否为临时点位 */
      isTemporary: boolean
    }
  }

  /** 交互类型表 */
  interface InteractionTypeMap {
    defaultMarker: MarkerWithRenderConfig
    unknown: unknown
  }

  /** 混合交互类型 */
  type InteractionInfo = MapToSchema<InteractionTypeMap>

  /** 任务类型表 */
  interface MissionTypeMap {
    markerDragging: Record<number, API.Coordinate2D>
    unknown: unknown
  }

  /** 混合任务类型 */
  type Mission = MapToSchema<MissionTypeMap>

  /** 点位关联 - 渲染单位 */
  interface MLRenderUnit {
    /** 源点位 id */
    source: number
    /** 目标点位 id */
    target: number
    /**
     * | 关联类型标识 | 名称 | 说明 | 关系图图解 |
     * | :--- | :--- | :--- | :--- |
     * | `TRIGGER` | 单触发 | 点对点的单向触发。 | `F->I` 或 `G->H` |
     * | `TRIGGER_ALL` | 全组触发 | 所有触发点位全部满足时，触发目标点位。 | `(A,B,C)->(D,E)` |
     * | `TRIGGER_ANY` | 任意触发 | 任意触发点位满足时，触发目标点位。 | `(D,E)->(F,G)` |
     * | `RELATED` | 关联 | 仅进行点位关联，但不触发联动标记操作。 | `(I,K,J)` |
     * | `EQUIVALENT` | 等价 | 同一组内等价的点位。 | `(H,M,L)` |
     */
    type: 'TRIGGER' | 'TRIGGER_ALL' | 'TRIGGER_ANY' | 'RELATED' | 'EQUIVALENT'
  }

  /**
   * 临时点位类型表
   * @note value 只能为 `API.MarkerVo` 或 `MarkerWithRenderConfig`
   */
  interface TempMarkerTypeMap {
    markerLink: API.MarkerVo[]
    markerDragging: MarkerWithRenderConfig[]
  }

  /** 临时点位类型 */
  type TempMarkerType = keyof TempMarkerTypeMap
}
