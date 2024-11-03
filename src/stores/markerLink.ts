import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import type { ShallowRef } from 'vue'
import { useSocketStore } from '.'
import { useBackendUpdate } from '@/stores/hooks'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'

export const useMarkerLinkStore = defineStore('global-marker-link', () => {
  const markerLinkList = shallowRef<API.MarkerLinkageVo[]>([])
  const total = computed(() => markerLinkList.value.length)

  const backendUpdater = useBackendUpdate(
    db.markerLink,
    async () => {
      const { data = '' } = await Api.markerLinkDoc.listAllMarkerLinkageBinaryMD5()
      return [data]
    },
    async (md5) => {
      const buffer = await Api.markerLinkDoc.listAllMarkerLinkageBinary({ responseType: 'arraybuffer' }) as unknown as ArrayBuffer
      const data = await Zip.decompressAs<Record<string, API.MarkerLinkageVo[]>>(new Uint8Array(buffer), {
        name: `markerLink-${md5}`,
      })
      const arrayData = Object.values(data).flat(1)
      return arrayData
    },
  )

  liveQuery(() => db.markerLink.toArray()).subscribe((list) => {
    markerLinkList.value = list
  })

  const socketStore = useSocketStore()

  socketStore.event.on('MarkerLinkageBinaryPurged', () => backendUpdater.refresh())

  return {
    total,
    markerLinkList: markerLinkList as Readonly<ShallowRef<API.MarkerLinkageVo[]>>,
    backendUpdater,
  }
})
