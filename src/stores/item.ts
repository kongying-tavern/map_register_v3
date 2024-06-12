import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import { useBackendUpdate, userHook } from './hooks'
import { useAccessStore, useUserAuthStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 本地物品数据 */
export const useItemStore = defineStore('global-item', () => {
  const accessStore = useAccessStore()

  const _itemList = shallowRef<API.ItemVo[]>([])
  const _total = ref(0)

  const itemIdMap = computed(() => _itemList.value.reduce((seed, item) => {
    seed.set(item.id!, item)
    return seed
  }, new Map<number, API.ItemVo>()))

  const backendUpdater = useBackendUpdate(
    db.item,
    async () => {
      const { data = '' } = await Api.itemDoc.listAllItemBinaryMd5()
      return [data]
    },
    async (md5) => {
      const buffer = await Api.itemDoc.listAllItemBinary({ responseType: 'arraybuffer' }) as unknown as ArrayBuffer
      const data = Zip.decompressAs<API.ItemVo[]>(new Uint8Array(buffer), {
        name: `item-${md5}`,
      })
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
    itemList: computed(() => _itemList.value
      .filter(({ hiddenFlag }) => accessStore.checkHiddenFlag(hiddenFlag))
      .sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia),
    ),

    itemIdMap,
    backendUpdater,
  }
})

userHook.onInfoChange(useItemStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
