import { useFetchHook } from '@/hooks'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import db from '@/database'
import type { useMarkerLinkStore } from '@/stores'

interface MarkerLinkHookOptions {
  markerLinkStore: ReturnType<typeof useMarkerLinkStore>
  currentMarkerIdMap: ComputedRef<Map<number, GSMapState.MarkerWithRenderConfig>>
  focusElements: Ref<Map<string, Set<unknown>>>
  staticMarkerIds: ComputedRef<Set<number>>
  setTempMarkers: (type: GSMapState.TempMarkerType, markers: API.MarkerVo[]) => void
}

/** 点位关联处理 hook */
export const useMarkerLink = (options: MarkerLinkHookOptions) => {
  const { markerLinkStore, currentMarkerIdMap, focusElements, setTempMarkers } = options

  const {
    loading: markerLinkLoading,
    data: markerLinkRenderList,
    refresh: setMLRenderList,
  } = useFetchHook({
    initialValue: [],
    onRequest: async (list: GSMapState.MLRenderUnit[]) => {
      const tempMarkerIds = new Set<number>()
      list.forEach(({ source, target }) => {
        tempMarkerIds.add(source!)
        tempMarkerIds.add(target!)
      })
      const tempMarkers = (await db.marker.bulkGet([...tempMarkerIds])).filter(Boolean) as API.MarkerVo[]
      setTempMarkers('markerLink', tempMarkers)
      return list
    },
  })

  watch(() => focusElements.value.get('marker') as Set<number> | undefined, (markerIds) => {
    const list: GSMapState.MLRenderUnit[] = []

    if (!markerIds || !markerIds.size || markerIds.size > 1) {
      setTempMarkers('markerLink', [])
      return setMLRenderList(list)
    }

    const focusedMarker = currentMarkerIdMap.value.get(markerIds.values().next().value)

    const { linkageId } = focusedMarker!

    markerLinkStore.markerLinkList.forEach(({ groupId, fromId, toId, linkAction }) => {
      if (groupId !== linkageId)
        return
      list.push({
        source: fromId!,
        target: toId!,
        type: linkAction! as GSMapState.MLRenderUnit['type'],
        key: `${Math.min(fromId!, toId!)}-${Math.max(fromId!, toId!)}-${linkAction! as GSMapState.MLRenderUnit['type']}`,
      })
    })

    setMLRenderList(list)
  })

  return {
    markerLinkLoading,
    markerLinkRenderList,
    setMLRenderList,
  }
}
