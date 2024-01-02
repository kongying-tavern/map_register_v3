import type { ShallowRef } from 'vue'
import { useFetchHook } from '@/hooks'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import db from '@/database'
import type { useMarkerLinkStore } from '@/stores'

interface MarkerLinkHookOptions {
  markerLinkStore: ReturnType<typeof useMarkerLinkStore>
  focus: ShallowRef<GSMapState.InteractionInfo | null>
  staticMarkerIds: ComputedRef<Set<number>>
  setTempMarkers: (type: GSMapState.TempMarkerType, markers: API.MarkerVo[]) => void
}

/** 点位关联处理 hook */
export const useMarkerLink = (options: MarkerLinkHookOptions) => {
  const { markerLinkStore, focus, staticMarkerIds, setTempMarkers } = options

  const { loading: markerLinkLoading, data: markerLinkRenderList, refresh: refreshMarkerLinkInfo } = useFetchHook({
    initialValue: [],
    onRequest: async () => {
      const list: GSMapState.MLRenderUnit[] = []

      if (focus.value?.type !== 'defaultMarker') {
        setTempMarkers('markerLink', [])
        return list
      }

      const { linkageId } = focus.value.value

      const tempMarkerIds: number[] = []
      const ids = staticMarkerIds.value

      markerLinkStore.markerLinkList.forEach(({ groupId, fromId, toId, linkAction }) => {
        if (groupId !== linkageId)
          return
        !ids.has(fromId!) && tempMarkerIds.push(fromId!)
        !ids.has(toId!) && tempMarkerIds.push(toId!)
        list.push({
          source: fromId!,
          target: toId!,
          type: linkAction! as GSMapState.MLRenderUnit['type'],
        })
      })

      const tempMarkers = (await db.marker.bulkGet([...new Set(tempMarkerIds)])).filter(Boolean) as API.MarkerVo[]

      setTempMarkers('markerLink', tempMarkers)

      return list
    },
  })

  watch(() => [focus.value, markerLinkStore.markerLinkList], refreshMarkerLinkInfo)

  return {
    markerLinkLoading,
    markerLinkRenderList,
  }
}
