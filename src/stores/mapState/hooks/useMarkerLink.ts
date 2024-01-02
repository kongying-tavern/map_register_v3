import type { ShallowRef } from 'vue'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import db from '@/database'

const getStrategy = (renderList: GSMapState.MLRenderUnit[]): Record<string, (info: API.RelationVo, relationMarkerId: number) => void> => ({
  TRIGGER: ({ triggers = [], targets = [] }) => {
    triggers.forEach(({ markerId: source }) => {
      targets.forEach(({ markerId: target }) => {
        renderList.push({
          type: 'TRIGGER',
          source: source!,
          target: target!,
        })
      })
    })
  },
  TRIGGER_ALL: ({ triggers = [], targets = [] }) => {
    triggers.forEach(({ markerId: source }) => {
      targets.forEach(({ markerId: target }) => {
        renderList.push({
          type: 'TRIGGER_ALL',
          source: source!,
          target: target!,
        })
      })
    })
  },
  TRIGGER_ANY: ({ triggers = [], targets = [] }) => {
    triggers.forEach(({ markerId: source }) => {
      targets.forEach(({ markerId: target }) => {
        renderList.push({
          type: 'TRIGGER_ANY',
          source: source!,
          target: target!,
        })
      })
    })
  },
  RELATED: ({ group = [] }, relationMarkerId) => {
    group.forEach(({ markerId: target }) => {
      renderList.push({
        type: 'RELATED',
        source: relationMarkerId,
        target: target!,
      })
    })
  },
  EQUIVALENT: ({ group = [] }, relationMarkerId) => {
    group.forEach(({ markerId: target }) => {
      renderList.push({
        type: 'EQUIVALENT',
        source: relationMarkerId,
        target: target!,
      })
    })
  },
})

interface MarkerLinkHookOptions {
  focus: ShallowRef<GSMapState.InteractionInfo | null>
  staticMarkerIds: ComputedRef<Set<number>>
  setTempMarkers: (type: GSMapState.TempMarkerType, markers: API.MarkerVo[]) => void
}

/** 点位关联处理 hook */
export const useMarkerLink = (options: MarkerLinkHookOptions) => {
  const { focus, staticMarkerIds, setTempMarkers } = options

  const { loading: markerLinkLoading, data: markerLinkRenderList, refresh: refreshMarkerLinkInfo } = useFetchHook({
    initialValue: [],
    onRequest: async () => {
      const list: GSMapState.MLRenderUnit[] = []

      if (focus.value?.type !== 'defaultMarker') {
        setTempMarkers('markerLink', [])
        return list
      }

      const { linkageId } = focus.value.value
      const { data = {} } = await Api.markerLink.getGraph({ groupIds: [linkageId!] })
      const graph = data[linkageId!]
      if (!graph) {
        setTempMarkers('markerLink', [])
        return list
      }

      const ids = staticMarkerIds.value
      const { relations = {}, relRefs = {} } = graph
      const strategy = getStrategy(list)

      const tempMarkerIds: number[] = []

      for (const markerStringId in relations) {
        const markerId = Number(markerStringId)
        if (!ids.has(markerId))
          tempMarkerIds.push(markerId)
        relations[markerStringId].forEach((referenceId) => {
          const relationInfo = relRefs[referenceId]
          relationInfo && strategy[relationInfo.type!](relationInfo, markerId)
        })
      }

      const tempMarkers = (await db.marker.bulkGet(tempMarkerIds)).filter(Boolean) as API.MarkerVo[]

      setTempMarkers('markerLink', tempMarkers)

      return list
    },
  })

  watch(focus, refreshMarkerLinkInfo)

  return {
    markerLinkLoading,
    markerLinkRenderList,
  }
}
