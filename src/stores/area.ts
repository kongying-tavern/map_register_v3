import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import { useBackendUpdate, userHook } from './hooks'
import { useAccessStore, useUserAuthStore } from '.'
import Api from '@/api/api'
import db from '@/database'

/** 本地地区数据 */
export const useAreaStore = defineStore('global-area', () => {
  const accessStore = useAccessStore()

  const _areaList = shallowRef<API.AreaVo[]>([])

  const areaList = computed(() => _areaList.value
    .filter(({ hiddenFlag }) => accessStore.checkHiddenFlag(hiddenFlag))
    .sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia),
  )
  const total = computed(() => _areaList.value.length)

  /** @deprecated */
  const areaMap = computed<Record<string, API.AreaVo>>(() => (Object.fromEntries(areaList.value.map(area => [
    area.id as number,
    area,
  ]))))

  const areaIdMap = computed(() => areaList.value.reduce((seed, area) => {
    seed.set(area.id!, area)
    return seed
  }, new Map<number, API.AreaVo>()))

  const areaCodeMap = computed(() => areaList.value.reduce((seed, area) => {
    seed.set(area.code!, area)
    return seed
  }, new Map<string, API.AreaVo>()))

  const parentAreaList = computed<API.AreaVo[]>(() => areaList.value.filter(area => !area.isFinal))
  const childrenAreaList = computed<API.AreaVo[]>(() => areaList.value.filter(area => area.isFinal))

  const _cachedData = shallowRef<API.AreaVo[]>([])

  const backendUpdater = useBackendUpdate(
    db.area,
    async () => {
      // 由于 area 接口暂无档案版，这里直接获取数据本体进行差异判断
      const { data = [] } = await Api.area.listArea({ parentId: -1, isTraverse: true })
      _cachedData.value = data
      const source = new TextEncoder().encode(JSON.stringify(data))
      const hash = await crypto.subtle.digest('SHA-1', source)
      const digest = [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
      return [digest]
    },
    () => _cachedData.value,
  )

  liveQuery(() => db.area.toArray()).subscribe((areaList) => {
    _areaList.value = areaList
  })

  return {
    total,
    areaList,
    areaMap,
    areaIdMap,
    areaCodeMap,
    parentAreaList,
    childrenAreaList,
    backendUpdater,
  }
})

userHook.onInfoChange(useAreaStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
