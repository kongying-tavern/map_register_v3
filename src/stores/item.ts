import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import type { ShallowRef } from 'vue'
import { useBackendUpdate, userHook } from './hooks'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 本地物品数据 */
export const useItemStore = defineStore('global-item', () => {
  const _itemList = shallowRef<API.ItemVo[]>([])
  const _total = ref(0)

  const itemIdMap = computed(() => _itemList.value.reduce((seed, item) => {
    seed.set(item.id!, item)
    return seed
  }, new Map<number, API.ItemVo>()))

  const backendUpdater = useBackendUpdate(
    db.item,
    async () => {
      const { data = '' } = await Api.itemDoc.listAllItemBz2Md5()
      return [data]
    },
    async (index) => {
      if (index !== 0)
        return []
      const buffer = await Api.itemDoc.listAllItemBz2({ responseType: 'arraybuffer' }) as unknown as ArrayBuffer
      const data = Zip.decompressAs<API.ItemVo[]>(new Uint8Array(buffer))
      return data
    },
  )

  liveQuery(() => db.item.toArray()).subscribe((itemList) => {
    _total.value = itemList.length
    _itemList.value = itemList
  })

  return {
    // getters
    total: _total as Readonly<Ref<number>>,
    itemList: _itemList as Readonly<ShallowRef<API.ItemVo[]>>,

    itemIdMap,
    backendUpdater,
  }
})

userHook.onInfoChange(useItemStore, async (store) => {
  await store.backendUpdater.start()
})
