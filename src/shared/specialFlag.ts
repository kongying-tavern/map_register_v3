import { BinaryMask } from '@/utils'

/**
 * 特殊标记掩码，适用于物品
 */
export const specialMask = new BinaryMask([
  // 是否为传送点位
  'isTeleportable',

  // 是否为自定义图标点位
  'isIconCustomizable',

  // 是否为洞口点位
  'isCaveEntrance',
] as const)

export const SPECIALFLAG_OPTIONS = [
  {
    label: '无',
    value: 'none',
    mask: 0,
  },
  {
    label: '可传送',
    value: 'isTeleportable',
    mask: specialMask.active(0, 'isTeleportable'),
  },
  {
    label: '可自定义图标',
    value: 'isIconCustomizable',
    mask: specialMask.active(0, 'isIconCustomizable'),
  },
  {
    label: '洞口',
    value: 'isCaveEntrance',
    mask: specialMask.active(0, 'isCaveEntrance'),
  },
]
