/** 历史记录 - 记录类型 */
export enum HistoryRecordType {
  /** 物品 */
  ITEM = 3,

  /** 点位 */
  MARKER = 4,
}

/** 历史记录 - 操作类型 */
export enum HistoryActionType {
  /** 缺省 */
  NONE = 0,

  /** 新增 */
  CREATE = 1,

  /** 更新 */
  UPDATE = 2,

  /** 删除 */
  DELETE = 3,
}
