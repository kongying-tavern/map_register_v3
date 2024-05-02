import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import { useBackendUpdate, userHook } from './hooks'
import { useAccessStore, useSocketStore, useUserAuthStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()

  const _markerList = shallowRef<API.MarkerVo[]>([])

  const markerList = computed(() => _markerList.value.filter(({ hiddenFlag }) => accessStore.checkHiddenFlag(hiddenFlag)))
  const total = computed(() => markerList.value.length)

  const backendUpdater = useBackendUpdate(
    db.marker,
    async () => {
      const { data = [] } = await Api.markerDoc.listMarkerBinaryMD5({})
      return data
    },
    async (md5) => {
      const buffer = await Api.markerDoc.listPageMarkerByBinary({ md5 }, { responseType: 'arraybuffer' }) as unknown as ArrayBuffer
      const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer))
      return data
    },
  )

  liveQuery(() => db.marker.toArray()).subscribe((list) => {
    _markerList.value = list
  })

  const socketStore = useSocketStore()

  socketStore.event.on('MarkerBinaryPurged', () => backendUpdater.refresh())

  return {
    total,
    markerList,
    backendUpdater,
  }
})

userHook.onInfoChange(useMarkerStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
