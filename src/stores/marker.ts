import type { ShallowRef } from 'vue'
import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import { useBackendUpdate, userHook } from './hooks'
import { useUserAuthStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const _total = ref(0)
  const _markerList = shallowRef<API.MarkerVo[]>([])

  const backendUpdater = useBackendUpdate(
    db.marker,
    async () => {
      const { data = [] } = await Api.markerDoc.listMarkerBz2MD5()
      return data
    },
    async (index) => {
      const buffer = await Api.markerDoc.listPageMarkerBy7zip({ index }, { responseType: 'arraybuffer' }) as unknown as ArrayBuffer
      const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer))
      return data
    },
  )

  liveQuery(() => db.marker.toArray()).subscribe((list) => {
    _total.value = list.length
    _markerList.value = list
  })

  return {
    total: _total as Readonly<Ref<number>>,
    markerList: _markerList as Readonly<ShallowRef<API.MarkerVo[]>>,
    backendUpdater,
  }
})

userHook.onInfoChange(useMarkerStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
