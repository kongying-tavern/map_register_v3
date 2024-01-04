import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import type { ShallowRef } from 'vue'
import { useUserAuthStore } from '.'
import { useBackendUpdate, userHook } from '@/stores/hooks'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'

export const useMarkerLinkStore = defineStore('global-marker-link', () => {
  const total = ref(0)
  const markerLinkList = shallowRef<API.MarkerLinkageVo[]>([])

  const backendUpdater = useBackendUpdate(
    db.markerLink,
    async () => {
      const { data = '' } = await Api.markerLinkDoc.listAllMarkerLinkageBz2MD5()
      return [data]
    },
    async () => {
      const buffer = await Api.markerLinkDoc.listAllMarkerLinkageBz2({ responseType: 'arraybuffer' }) as unknown as ArrayBuffer
      const data = await Zip.decompressAs<Record<string, API.MarkerLinkageVo[]>>(new Uint8Array(buffer))
      const arrayData = Object.values(data).flat(1)
      return arrayData
    },
  )

  liveQuery(() => db.markerLink.toArray()).subscribe((list) => {
    total.value = list.length
    markerLinkList.value = list
  })

  return {
    total: total as Readonly<Ref<number>>,
    markerLinkList: markerLinkList as Readonly<ShallowRef<API.MarkerLinkageVo[]>>,
    backendUpdater,
  }
})

userHook.onInfoChange(useMarkerLinkStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
