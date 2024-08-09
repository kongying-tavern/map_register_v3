import { BinaryMask } from '@/utils'

/**
 * 特殊标记掩码，适用于物品
 */
export const specialMask = new BinaryMask([
  // 是否为传送点位
  'isTeleportable',

  // 是否为自定义图标点位
  'isIconCustomizable',
] as const)

export const SPECIALFLAG_OPTIONS = [
  { label: '可传送', value: 'isTeleportable' },
  { label: '可自定义图标', value: 'isIconCustomizable' },
]
