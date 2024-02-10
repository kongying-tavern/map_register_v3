/** 操作记录枚举 */
export enum EditTypeEnum {
  NONE = 0,
  CREATE = 1,
  UPDATE = 2,
  DELETE = 3,
}

/** 操作记录类型表 */
export const EDIT_TYPE_MAP = {
  [EditTypeEnum.NONE]: '缺省',
  [EditTypeEnum.CREATE]: '新增',
  [EditTypeEnum.DELETE]: '删除',
  [EditTypeEnum.UPDATE]: '修改',
}
