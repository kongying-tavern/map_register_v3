import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import type { ShallowRef } from 'vue'
import { useBackendUpdate, userHook } from './hooks'
import Api from '@/api/api'
import db from '@/database'

/** 本地地区数据 */
export const useAreaStore = defineStore('global-area', () => {
  const _areaList = shallowRef<API.AreaVo[]>([])
  const _total = ref(0)

  const areaMap = computed<Record<string, API.AreaVo>>(() => (Object.fromEntries(_areaList.value.map(area => [
    area.id as number,
    area,
  ]))))

  const areaIdMap = computed(() => _areaList.value.reduce((seed, area) => {
    seed.set(area.id!, area)
    return seed
  }, new Map<number, API.AreaVo>()))

  const areaCodeMap = computed(() => _areaList.value.reduce((seed, area) => {
    seed.set(area.code!, area)
    return seed
  }, new Map<string, API.AreaVo>()))

  const _cachedData = shallowRef<API.AreaVo[]>([])

  const backendUpdater = useBackendUpdate(
    db.area,
    async () => {
      // 由于 area 接口暂无档案版，这里直接获取数据本体进行差异判断
      const { data = [] } = await Api.area.listArea({}, { parentId: -1, isTraverse: true })
      _cachedData.value = data
      const source = new TextEncoder().encode(JSON.stringify(data))
      const hash = await crypto.subtle.digest('SHA-1', source)
      const digest = [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
      return [digest]
    },
    async (index) => {
      if (index !== 0)
        return []
      return _cachedData.value
    },
  )

  liveQuery(() => db.area.toArray()).subscribe((areaList) => {
    _areaList.value = areaList
    _total.value = areaList.length
  })

  return {
    total: _total as Readonly<Ref<number>>,
    areaList: _areaList as Readonly<ShallowRef<API.AreaVo[]>>,
    areaMap,
    areaIdMap,
    areaCodeMap,
    backendUpdater,
  }
})

userHook.onInfoChange(useAreaStore, async (store) => {
  await store.backendUpdater.start()
})
