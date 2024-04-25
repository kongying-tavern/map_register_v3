import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import { useBackendUpdate, userHook } from './hooks'
import { useAccessStore, useUserAuthStore } from '.'
import Api from '@/api/api'
import db from '@/database'

/** 本地物品类型数据 */
export const useItemTypeStore = defineStore('global-item-type', () => {
  const accessStore = useAccessStore()

  const _itemTypeList = shallowRef<API.ItemTypeVo[]>([])

  const itemTypeList = computed(() => _itemTypeList.value.filter(({ hiddenFlag }) => accessStore.checkHiddenFlag(hiddenFlag)))
  const total = computed(() => itemTypeList.value.length)

  const itemTypeMap = computed(() => (Object.fromEntries(itemTypeList.value.map(itemType => [
    itemType.id as number,
    itemType,
  ])) as Record<string, API.ItemTypeVo>))

  const itemTypeIdMap = computed(() => itemTypeList.value.reduce((seed, itemType) => {
    seed.set(itemType.id!, itemType)
    return seed
  }, new Map<number, API.ItemTypeVo>()))

  const _cachedData = shallowRef<API.AreaVo[]>([])

  const backendUpdater = useBackendUpdate(
    db.itemType,
    async () => {
      // 由于 area 接口暂无档案版，这里直接获取数据本体进行差异判断
      const { data = [] } = await Api.itemType.listItemType({})
      _cachedData.value = data
      const source = new TextEncoder().encode(JSON.stringify(data))
      const hash = await crypto.subtle.digest('SHA-1', source)
      const digest = [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
      return [digest]
    },
    () => _cachedData.value,
  )

  liveQuery(() => db.itemType.toArray()).subscribe((list) => {
    _itemTypeList.value = list
  })

  return {
    total,
    itemTypeList,
    itemTypeMap,
    itemTypeIdMap,
    backendUpdater,
  }
})

userHook.onInfoChange(useItemTypeStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
