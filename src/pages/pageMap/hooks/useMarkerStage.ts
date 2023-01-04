import Api from '@/api/api'
import { useFetchHook } from '@/hooks'
import { messageFrom } from '@/utils'

/** 暂存点位管理 */
export const useMarkerStage = (init: API.MarkerPunctuateVo = {}) => {
  const loading = ref(false)

  const markerData = ref<API.MarkerPunctuateVo>(init)

  const successHook = createEventHook<void>()
  const errorHook = createEventHook<Error>()

  const { refresh: stageMarker, onSuccess: onStageSuccess, onError: onCreateError } = useFetchHook({
    loading,
    onRequest: () => Api.punctuate.addPunctuate({}, markerData.value),
  })
  onStageSuccess(() => successHook.trigger())
  onCreateError(errorHook.trigger)

  const { refresh: updateStagedMarker, onSuccess: onUpdateStagedSuccess, onError: onUpdateStagedError } = useFetchHook({
    loading,
    onRequest: () => Api.marker.updateMarker(markerData.value),
  })
  onUpdateStagedSuccess(() => successHook.trigger())
  onUpdateStagedError(errorHook.trigger)

  const deleteStagedMarker = async (markerId?: number) => {
    if (markerId === undefined)
      return
    try {
      loading.value = true
      await Api.marker.deleteMarker({ markerId })
      successHook.trigger()
    }
    catch (err) {
      errorHook.trigger(new Error(messageFrom(err)))
    }
    finally {
      loading.value = false
    }
  }

  return {
    markerData,
    loading,
    stageMarker,
    updateStagedMarker,
    deleteStagedMarker,
    onSuccess: successHook.on,
    onError: errorHook.on,
  }
}
