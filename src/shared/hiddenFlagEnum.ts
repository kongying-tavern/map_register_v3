/** 隐藏标记枚举 */
export enum HiddenFlagEnum {
  /** 显示 */
  SHOW = 0,
  /** 隐藏 */
  HIDDEN = 1,
  /** 内鬼（测试服） */
  NEIGUI = 2,
}

export const HIDDEN_FLAG_NAM_MAP: Record<string, string> = {
  [HiddenFlagEnum.SHOW]: '显示',
  [HiddenFlagEnum.HIDDEN]: '隐藏',
  [HiddenFlagEnum.NEIGUI]: '测试服',
}
