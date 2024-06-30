import type { Color } from '@deck.gl/core'

/** 点位关联行为枚举 */
export enum LinkActionEnum {
  /** 单触发 - 点对点的单向触发。 */
  TRIGGER = 'TRIGGER',

  /** 全组触发 - 所有触发点位全部满足时，触发目标点位。 */
  TRIGGER_ALL = 'TRIGGER_ALL',

  /** 任意触发 - 任意触发点位满足时，触发目标点位。 */
  TRIGGER_ANY = 'TRIGGER_ANY',

  /** 关联 - 仅进行点位关联，但不触发联动标记操作。 */
  RELATED = 'RELATED',

  /** 等价 - 同一组内等价的点位。 */
  EQUIVALENT = 'EQUIVALENT',
}

/** 点位关联行为选项 */
export const LINK_ACTION_OPTIONS = [
  { label: '单触发', value: LinkActionEnum.TRIGGER },
  { label: '全组触发', value: LinkActionEnum.TRIGGER_ALL },
  { label: '任意触发', value: LinkActionEnum.TRIGGER_ANY },
  { label: '关联', value: LinkActionEnum.RELATED },
  { label: '等价', value: LinkActionEnum.EQUIVALENT },
]

export const LINK_ACTION_NAME_MAP = LINK_ACTION_OPTIONS
  .reduce((map, { label, value }) => map.set(value, label), new Map<LinkActionEnum, string>())

export interface LinkActionConfig {
  /** 指示线颜色 */
  lineColor: Color
}

export const LINK_ACTION_CONFIG: Record<LinkActionEnum, LinkActionConfig> = {
  [LinkActionEnum.TRIGGER]: {
    lineColor: [255, 0, 0], // rgb(255 0 0)
  },
  [LinkActionEnum.TRIGGER_ALL]: {
    lineColor: [0, 0, 128], // rgb(0 0 128)

  },
  [LinkActionEnum.TRIGGER_ANY]: {
    lineColor: [173, 216, 230], // rgb(173 216 230)
  },
  [LinkActionEnum.RELATED]: {
    lineColor: [255, 165, 0], // rgb(255 165 0)

  },
  [LinkActionEnum.EQUIVALENT]: {
    lineColor: [0, 128, 0], // rgb(0 128 0)

  },
}
