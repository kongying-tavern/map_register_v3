/** 操作记录枚举 */
export enum EditTypeEnum {
  NONE = 0,
  CREATE = 1,
  UPDATE = 2,
  DELETE = 3,
  TWEAK = 10,
}

/** 操作记录类型表 */
export const EDIT_TYPE_MAP: Record<EditTypeEnum, string> = {
  [EditTypeEnum.NONE]: '缺省',
  [EditTypeEnum.CREATE]: '新增',
  [EditTypeEnum.DELETE]: '删除',
  [EditTypeEnum.UPDATE]: '修改',
  [EditTypeEnum.TWEAK]: '批量修改',
}
