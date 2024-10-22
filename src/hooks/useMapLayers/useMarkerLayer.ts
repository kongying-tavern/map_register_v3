import { useSubscription } from '@vueuse/rxjs'
import { filter } from 'rxjs'
import { GSMarkerLayer } from '@/packages/map'
import type { GSMarkerInfo } from '@/packages/map'
import { MapSubject } from '@/shared'
import { useArchiveStore, useIconTagStore, useMapStateStore } from '@/stores'

export const useMarkerLayer = () => {
  const archiveStore = useArchiveStore()
  const iconTagStore = useIconTagStore()
  const mapStateStore = useMapStateStore()

  // 点位 focus
  useSubscription(MapSubject.click.pipe(
    filter(({ info, event }) => [
      info.layer instanceof GSMarkerLayer,
      event.leftButton,
    ].every(Boolean)),
  ).subscribe(({ info }) => {
    const key = GSMarkerLayer.layerName
    if (!info.object) {
      mapStateStore.interaction.removeFocus(key)
      return
    }
    const markerInfo = info.object as GSMarkerInfo
    const oldHover = mapStateStore.interaction.focusElements.get(key) as (Set<number> | undefined)
    if (oldHover?.has(markerInfo.id!))
      return
    mapStateStore.interaction.setFocus(key, new Set([markerInfo.id!]))
  }))

  // 点位 hover
  useSubscription(MapSubject.hover.pipe(
    filter(({ info }) => info.layer instanceof GSMarkerLayer),
  ).subscribe(({ info }) => {
    const key = GSMarkerLayer.layerName
    if (!info.object) {
      mapStateStore.interaction.removeHover(key)
      return
    }
    const markerInfo = info.object as GSMarkerInfo
    const oldHover = mapStateStore.interaction.hoverElements.get(key) as (Set<number> | undefined)
    if (oldHover?.has(markerInfo.id!))
      return
    mapStateStore.interaction.setHover(key, new Set([markerInfo.id!]))
  }))

  const markerLayer = computed<GSMarkerLayer | undefined>(() => {
    if (!iconTagStore.markerSpriteUrl)
      return

    const key = GSMarkerLayer.layerName
    const hoverMarkerIds = mapStateStore.interaction.hoverElements.get(key) as (Set<number> | undefined)
    const focusMarkerIds = mapStateStore.interaction.focusElements.get(key) as (Set<number> | undefined)
    const markedMarkerIds = archiveStore.currentArchive.body.Data_KYJG as Set<number>

    return new GSMarkerLayer({
      data: mapStateStore.currentMarkers,
      hoverMarkerIds,
      focusMarkerIds,
      markedMarkerIds,
      iconAtlas: iconTagStore.markerSpriteUrl,
      iconMapping: iconTagStore.markerSpriteMapping,
      transparentMarked: true,
    })
  })

  return {
    markerLayer,
  }
}
