import type { FetchHookOptions } from '@/hooks'
import { useFetchHook } from '@/hooks'
import db from '@/database'

interface ItemListHookOption extends Omit<FetchHookOptions<API.RListItemVo>, 'immediate'> {
  params?: () => {
    typeIdList?: number[]
    areaIdList?: number[]
  }
}

/** 拉取物品id */
export const useItemList = (options: ItemListHookOption = {}) => {
  const { params } = options

  const fetchParams = computed(() => params?.())

  const itemList = ref<API.ItemVo[]>([])

  const itemOptions = computed(() => itemList.value.map(itemvo => ({
    label: `${itemvo.name} (id: ${itemvo.id})`,
    value: itemvo.id,
  })))

  const { refresh: getItemList, onSuccess, ...rest } = useFetchHook<API.ItemVo[]>({
    immediate: true,
    onRequest: () => {
      const { areaIdList = [], typeIdList = [] } = fetchParams.value ?? {}
      const isArea = areaIdList.length > 0
      const isType = typeIdList.length > 0

      // 如果地区和类型都没有值在，则返回全部物品
      if (!isArea && !isType)
        return db.item.toArray()

      // 如果只有类型，则按类型筛选
      if (!isArea)
        return db.item.where('typeIdList').anyOf(typeIdList).toArray()

      // 如果只有地区，则按地区筛选
      if (!isType)
        return db.item.where('id').anyOf(areaIdList).toArray()

      // 如果地区和类型同时存在，则先筛类型后筛地区
      return db.item.where('typeIdList').anyOf(typeIdList).and(({ areaId = -9999 }) => areaIdList.includes(areaId)).toArray()
    },
  })

  onSuccess((data) => {
    itemList.value = data.sort(({ sortIndex: a = -1 }, { sortIndex: b = -1 }) => b - a)
  })

  watch(fetchParams, getItemList, { deep: true })

  return { itemList, itemOptions, getItemList, onSuccess, ...rest }
}
