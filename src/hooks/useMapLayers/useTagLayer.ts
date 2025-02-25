import type { MapLayerHookOptions } from '.'
import {
  GSTagLayer,
} from '@/packages/map'
import { usePreferenceStore, useTileStore } from '@/stores'

export const useTagLayer = (options: MapLayerHookOptions) => {
  const { resourceStatus } = options

  const tileStore = useTileStore()
  const preferenceStore = usePreferenceStore()

  const tagLayer = computed(() => {
    const tile = tileStore.currentTileConfig?.tile
    if (!tile || !resourceStatus.value.fonts)
      return
    return new GSTagLayer({
      visible: preferenceStore.showZoneTag,
      tagGroups: tileStore.visibleTagGroups,
      offset: tile.center,
    })
  })

  return {
    tagLayer,
  }
}
