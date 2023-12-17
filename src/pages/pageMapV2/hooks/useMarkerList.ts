import { storeToRefs } from 'pinia'
import { AreaTileConfig, useAreaStore, useItemStore, usePreferenceStore, useTileStore } from '@/stores'
import db from '@/database'
import { useFetchHook } from '@/hooks'

export const useMarkerList = () => {
  const { data: markerList, loading, refresh } = useFetchHook({
    initialValue: [],
  })

  return {
    loading,
    markerList,
  }
}
