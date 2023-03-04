import type { CascaderOption } from 'element-plus'

export interface ExtraOption extends CascaderOption {
  label: string
  value?: string
  /** 二级选项 */
  children?: Omit<ExtraOption, 'children'>[]
}

/** 须弥 - 大赤沙海地下配置 */
export const getDesertOptions = (): ExtraOption[] => [
  { label: '地下', value: 'ug' },
  {
    label: '圣显',
    value: 'sx',
    children: [
      { label: '圣显 · 上', value: '1' },
      { label: '圣显 · 中', value: '2' },
      { label: '圣显 · 下', value: '3' },
    ],
  },
  {
    label: '舍身',
    value: 'ss',
    children: [
      { label: '舍身 · 上', value: '1' },
      { label: '舍身 · 中', value: '2' },
      { label: '舍身 · 下', value: '3' },
    ],
  },
  {
    label: '秘仪',
    value: 'my',
    children: [
      { label: '秘仪 · 上', value: '1' },
      { label: '秘仪 · 中', value: '2' },
      { label: '秘仪 · 下', value: '3' },
    ],
  },
  {
    label: '王陵',
    value: 'wl',
    children: [
      { label: '王陵 · 初', value: '0' },
      { label: '王陵 · 上', value: '1' },
      { label: '王陵 · 中', value: '2' },
      { label: '王陵 · 下', value: '3' },
    ],
  },
]

/** 须弥 - 千壑沙地地下配置 */
export const getDesert2Options = (): ExtraOption[] => [
  { label: '地下1', value: 'ug1' },
  { label: '地下2', value: 'ug2' },
  { label: '地下3', value: 'ug3' },
]

/** 2.8 海岛配置 */
export const getIslandOptions = (): ExtraOption[] => [
  {
    label: '危危岛',
    value: 'ww',
    children: [
      { label: '初始', value: '0' },
      { label: '沉入水下', value: '1' },
    ],
  },
  {
    label: '破破岛',
    value: 'pp',
    children: [
      { label: '初始', value: '0' },
      { label: '低', value: '2' },
      { label: '高', value: '1' },
    ],
  },
  {
    label: '双双岛',
    value: 'ss',
    children: [
      { label: '初始', value: '0' },
      { label: '最终形态', value: '3' },
    ],
  },
  {
    label: '布丁岛',
    value: 'bd',
    children: [
      { label: '初始', value: '0-0' },
      { label: '任意-优悠', value: '0-1' },
      { label: '任意-浮光', value: '0-2' },
      { label: '任意-磐固', value: '0-3' },
      { label: '优悠-任意', value: '1-0' },
      { label: '浮光-任意', value: '2-0' },
      { label: '磐固-任意', value: '3-0' },
      { label: '优悠-优悠', value: '1-1' },
      { label: '优悠-浮光', value: '1-2' },
      { label: '优悠-磐固', value: '1-3' },
      { label: '磐固-优悠', value: '3-1' },
      { label: '磐固-浮光', value: '3-2' },
      { label: '磐固-磐固', value: '3-3' },
      { label: '浮光-优悠', value: '2-1' },
      { label: '浮光-浮光', value: '2-2' },
      { label: '浮光-磐固', value: '2-3' },
    ],
  },
]
