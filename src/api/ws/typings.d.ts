declare namespace API {
  /** WebSocket 接收的数据 */
  interface WSReceviedData<K extends WSEventType> {
    event: K
    message?: string
    data: WSEventMap[K]
    time?: string
  }

  /** WebSocket 发送的数据 */
  interface WSSentData<T = unknown> extends Record<string, unknown> {
    action: string
    data?: T
  }

  interface WSEventMap {
    // ====================   其他   ====================

    /** 心跳包 */
    Pong: []

    // ==================== 应用相关 ====================

    /** 应用更新通知 */
    AppUpdated: []

    // ==================== 图标相关 ====================

    /**
     * 图标标签 Bz2 刷新
     */
    IconTagBinaryPurged: []

    // ==================== 物品相关 ====================

    /**
     * 物品新增
     * @local 服务端无此 ws 事件
     */
    ItemAdded: [ItemId: number]

    /**
     * 物品修改
     * @local 服务端无此 ws 事件
     */
    ItemUpdated: [ItemId: number]

    /**
     * 物品修改
     * @local 服务端无此 ws 事件
     */
    ItemDeleted: [ItemId: number]

    /**
     * 物品 Bz2 刷新
     */
    ItemBinaryPurged: []

    // ==================== 点位相关 ====================

    /**
     * 点位新增
     * @data 点位 id
     */
    MarkerAdded: [number]

    /**
     * 点位修改
     * @data 点位 id
     */
    MarkerUpdated: [number]

    /**
     * 点位删除
     * @data 点位 id
     */
    MarkerDeleted: [number]

    /**
     * 点位调整
     * @data 点位 id 列表
     */
    MarkerTweaked: [number[]]

    /**
     * 点位 Bz2 刷新
     */
    MarkerBinaryPurged: []

    // ==================== 点位关联相关 ====================

    /**
     * 点位关联
     * @see `API.WSMarkerLinkData`
     */
    MarkerLinked: [WSMarkerLinkData]

    /**
     * 点位关联Bz2刷新
     */
    MarkerLinkageBinaryPurged: []

    // ==================== 公告相关 ====================

    /**
     * 公告新增
     * @data 公告 id
     */
    NoticeAdded: [number]

    /**
     * 公告新增
     * @data 公告 id
     */
    NoticeUpdated: [number]

    /**
     * 公告新增
     * @data 公告 id
     */
    NoticeDeleted: [number]

    // ==================== 用户相关 ====================

    /**
     * 用户踢出
     */
    UserKickedOut: []
  }

  type WSEventType = keyof WSEventMap

  type WSData<K extends WSEventType = WSEventType> = WSReceviedData<K>

  /** 点位关联的负载数据 */
  interface WSMarkerLinkData {
    groups: string[]
    markers: number[]
  }
}
