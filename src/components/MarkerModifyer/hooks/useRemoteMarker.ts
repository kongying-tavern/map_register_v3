import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { useSocketStore } from '@/stores'

export const useRemoteMarker = (markerId: MaybeRefOrGetter<number | undefined> | number | undefined) => {
  const socketStore = useSocketStore()

  const {
    data,
    loading,
    refresh,
  } = useFetchHook({
    immediate: true,
    onRequest: async () => {
      const id = toValue(markerId)
      if (id === undefined)
        return
      const { data } = await Api.marker.listMarkerById([id])
      return data?.[0]
    },
  })

  isRef(markerId) && watch(markerId, () => refresh())

  const off1 = socketStore.socketEvent.on('MarkerUpdated', (remoteMarkerId) => {
    if (remoteMarkerId !== toValue(markerId))
      return
    refresh()
  })

  const off2 = socketStore.socketEvent.on('MarkerDeleted', (remoteMarkerId) => {
    if (remoteMarkerId !== toValue(markerId))
      return
    refresh()
  })

  onBeforeUnmount(() => {
    off1()
    off2()
  })

  return {
    data,
    loading,
  }
}
