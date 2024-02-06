import type { Arrayable } from '@vueuse/core'
import type { FormItemRule } from 'element-plus'
import db from '@/database'

export type Trigger = 'blur' | 'change' | 'active'

export type ItemFormRules<T> = {
  [P in keyof T]?: Arrayable<FormItemRule>
}

export const requireCheck = (trigger: Trigger, name: string) => ({
  required: true,
  message: `${name}不能为空`,
  trigger,
})

export const lengthCheck = (trigger: Trigger, name: string, max: number, min = 1): FormItemRule => ({
  required: true,
  message: `${name}需要 ${min} - ${max} 个非空白字符`,
  pattern: new RegExp(`\\S{${min},${max}}`),
  trigger,
})

export const emptyCheck = (name = '', trigger: Trigger = 'blur') => ({
  message: `${name}不能含有空白字符`,
  pattern: /^\S+$/,
  trigger,
})

export const qqCheck = (): FormItemRule => ({
  required: true,
  message: '必须为 10000-9999999999 之间的号码',
  validator: (_, value = '') => {
    const qq = Number(value)
    return qq >= 10000 && qq <= 99999999999
  },
})

export const passwordCheck = (): FormItemRule => ({
  required: true,
  message: '密码至少需要6个字符',
  validator: (_, v = '') => v.length >= 6,
})

/** 检查在选取了宝箱品质的情况下，是否有至少一个获取方式 */
export const isTreasureChestMatched = (): FormItemRule => ({
  // TODO 暂时使用名称匹配
  asyncValidator: async (_, linkItems: API.MarkerItemLinkVo[] = []) => {
    const treasureChestId = (await db.itemType.where('name').equals('宝箱品质').first())?.id
    const wayToGetId = (await db.itemType.where('name').equals('获取方式').first())?.id
    if (treasureChestId === undefined || wayToGetId === undefined)
      return

    const itemsIds = (linkItems ?? []).map(linkItem => linkItem.itemId!)
    const items = (await db.item.bulkGet(itemsIds)).filter(Boolean) as API.ItemVo[]

    const hasTreasureChest = Boolean(items.find(item => Boolean(item.typeIdList?.find(itemTypeId => itemTypeId === treasureChestId))))
    if (!hasTreasureChest)
      return

    const hasWayToGet = Boolean(items.find(item => Boolean(item.typeIdList?.find(itemTypeId => itemTypeId === wayToGetId))))
    if (hasWayToGet)
      return

    throw new Error('必须为宝箱选择一个获取方式')
  },
  trigger: 'change',
})
