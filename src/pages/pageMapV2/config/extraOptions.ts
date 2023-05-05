import type { CascaderOption } from 'element-plus'

export interface ExtraOption extends CascaderOption {
  label: string
  value?: string
  /** 二级选项 */
  children?: Omit<ExtraOption, 'children'>[]
}

/** 地下选项表 */
export const UNDERGROUND_OPTIONS_MAP: Record<string, { modelId: string; options: ExtraOption[] }> = {
  /** 须弥 - 大赤沙海 */
  'A:XM:DESERT': {
    modelId: 'sumeru2',
    options: [
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
    ],
  },

  /** 须弥 - 千壑沙地 */
  'A:XM:DESERT2': {
    modelId: 'sumeru2',
    options: [
      {
        label: '赤王',
        value: 'cw',
        children: [
          { label: '赤王 · 上', value: '1' },
          { label: '赤王 · 中', value: '2' },
          { label: '赤王 · 下', value: '3' },
        ],
      },
      {
        label: '君王',
        value: 'jw',
        children: [
          { label: '君王 · 上', value: '1' },
          { label: '君王 · 中', value: '2' },
          { label: '君王 · 下', value: '3' },
        ],
      },
      {
        label: '沙虫',
        value: 'sc',
        children: [
          { label: '沙虫 · 上', value: '1' },
          { label: '沙虫 · 中', value: '2' },
          { label: '沙虫 · 下', value: '3' },
        ],
      },
      {
        label: '酣乐',
        value: 'hl',
        children: [
          { label: '酣乐 · 上', value: '1' },
          { label: '酣乐 · 中', value: '2' },
          { label: '酣乐 · 下', value: '3' },
          { label: '酣乐 · 底', value: '4' },
        ],
      },
      {
        label: '其他',
        value: 'misc',
        children: [
          { label: '永恒绿洲', value: '1' },
          { label: '赤王的水晶杯', value: '2' },
        ],
      },
    ],
  },

  /** 须弥 - 佑灵砾漠 */
  'A:XM:DESERT3': {
    modelId: 'sumeru2',
    options: [],
  },
}

/** 2.8 海岛选项 */
export const APPLE_2_8_OPTIONS: ExtraOption[] = [
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
