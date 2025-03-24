/** 历史记录 - 记录类型 */
export enum HistoryRecordType {
  /** 地区 */
  AREA = 1,

  /** 图标 */
  ICON = 2,

  /** 物品 */
  ITEM = 3,

  /** 点位 */
  MARKER = 4,

  /** 图标标签 */
  ICONTAG = 5,
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

  /** 批量 */
  TWEAK = 10,
}

export const HISTORY_ACTION_TYPE_NAME_MAP = new Map<number, string>([
  [HistoryActionType.NONE, '缺省'],
  [HistoryActionType.CREATE, '新增'],
  [HistoryActionType.UPDATE, '更新'],
  [HistoryActionType.DELETE, '删除'],
  [HistoryActionType.TWEAK, '批量编辑'],
])
