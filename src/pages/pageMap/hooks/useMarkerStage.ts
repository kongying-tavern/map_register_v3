import type { Ref } from 'vue'
import type { MarkerFormData } from './useMarkerEdit'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

/** 暂存点位管理 */
export const useMarkerStage = (markerData: Ref<MarkerFormData>) => {
  const { refresh: stageMarker, loading: stageLoading, onSuccess: onStageSuccess, onError: onStageError } = useFetchHook({
    onRequest: () => Api.punctuate.addPunctuate({}, markerData.value),
  })

  const { refresh: pushStagedMarker, onSuccess: onPushStagedSuccess, onError: onPushStagedError } = useFetchHook({
    loading: stageLoading,
    onRequest: () => {
      if (markerData.value.author === undefined)
        throw new Error('用户 id 为空')
      return Api.punctuate.pushPunctuate({ authorId: markerData.value.author })
    },
  })

  const { refresh: updateStagedMarker, loading: updateLoading, onSuccess: onUpdateStagedSuccess, onError: onUpdateStagedError } = useFetchHook({
    onRequest: () => Api.punctuate.updateSelfPunctuate({}, markerData.value),
  })

  const { refresh: deleteStagedMarker, loading: deleteLoading, onSuccess: onDeleteStagedSuccess, onError: onDeleteStagedError } = useFetchHook({
    onRequest: () => {
      if (markerData.value.punctuateId === undefined || markerData.value.author === undefined)
        throw new Error('暂存点位 id 为空或作者 id 为空')
      return Api.punctuate.deleteSelfPunctuate({ punctuateId: markerData.value.punctuateId, authorId: markerData.value.author })
    },
  })

  // TODO 这里应该再做一个界面显示暂存点位，而不是自动将暂存点位提交审核
  onStageSuccess(pushStagedMarker)

  return {
    markerData,
    stageLoading,
    updateLoading,
    deleteLoading,

    stageMarker,
    pushStagedMarker,
    updateStagedMarker,
    deleteStagedMarker,

    onStageSuccess,
    onStageError,
    onPushStagedSuccess,
    onPushStagedError,
    onUpdateStagedSuccess,
    onUpdateStagedError,
    onDeleteStagedSuccess,
    onDeleteStagedError,
  }
}
