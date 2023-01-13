import type { Ref } from 'vue'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export interface MarkerFormData extends API.MarkerVo, API.MarkerPunctuateVo {}

export const useMarkerEdit = (markerData: Ref<MarkerFormData>) => {
  const { refresh: createMarker, loading: createLoading, onSuccess: onCreateSuccess, onError: onCreateError } = useFetchHook({
    onRequest: () => Api.marker.createMarker(markerData.value),
  })

  const { refresh: updateMarker, loading: editLoading, onSuccess: onEditSuccess, onError: onEditError } = useFetchHook({
    onRequest: () => Api.marker.updateMarker(markerData.value),
  })

  const { refresh: deleteMarker, loading: deleteLoading, onSuccess: onDeleteSuccess, onError: onDeleteError } = useFetchHook({
    onRequest: () => {
      if (markerData.value.id === undefined)
        throw new Error('点位 id 为空')
      return Api.marker.deleteMarker({ markerId: markerData.value.id })
    },
  })

  return {
    markerData,
    createLoading,
    editLoading,
    deleteLoading,

    createMarker,
    updateMarker,
    deleteMarker,

    onCreateSuccess,
    onCreateError,
    onEditSuccess,
    onEditError,
    onDeleteSuccess,
    onDeleteError,
  }
}
