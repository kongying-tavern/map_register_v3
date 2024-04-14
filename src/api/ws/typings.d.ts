declare namespace API {
  /** WebSocket 接收的数据 */
  interface WSReceviedData<K extends WSEventType> {
    event: K
    message?: string
    data?: WSEventMap[K]
    time?: string
  }

  /** WebSocket 发送的数据 */
  interface WSSentData<T = unknown> {
    action: string
    data?: T
  }

  interface WSEventMap {
    // ====================   其他   ====================

    /** 心跳包 */
    Pong: void

    // ==================== 图标相关 ====================

    /**
     * 图标标签 Bz2 刷新
     */
    IconTagBz2Purged: void

    // ==================== 物品相关 ====================

    /**
     * 物品 Bz2 刷新
     */
    ItemBz2Purged: void

    // ==================== 点位相关 ====================

    /**
     * 点位新增
     * @data 点位 id
     */
    MarkerAdded: number

    /**
     * 点位修改
     * @data 点位 id
     */
    MarkerUpdated: number

    /**
     * 点位删除
     * @data 点位 id
     */
    MarkerDeleted: number

    /**
     * 点位调整
     * @data 点位 id 列表
     */
    MarkerTweaked: number[]

    /**
     * 点位 Bz2 刷新
     */
    MarkerBz2Purged: void

    // ==================== 点位关联相关 ====================

    /**
     * 点位关联
     * @see `API.WSMarkerLinkData`
     */
    MarkerLinked: WSMarkerLinkData

    /**
     * 点位关联Bz2刷新
     */
    MarkerLinkageBz2Purged: void

    // ==================== 公告相关 ====================

    /**
     * 公告新增
     * @data 公告 id
     */
    NoticeAdded: number

    /**
     * 公告新增
     * @data 公告 id
     */
    NoticeUpdated: number

    /**
     * 公告新增
     * @data 公告 id
     */
    NoticeDeleted: number
  }

  type WSEventType = keyof WSEventMap

  type WSData<K extends WSEventType = WSEventType> = WSReceviedData<K>

  /** 点位关联的负载数据 */
  interface WSMarkerLinkData {
    groups: string[]
    markers: number[]
  }
}
