<script lang="ts" setup>
import type { GSMarkerInfo } from '@/packages/map'
import type { Layer } from 'deck.gl'
import { GSButton } from '@/components'
import { GSMarkerLayer } from '@/packages/map'
import { MapSubject } from '@/shared'
import { useAccessStore, useArchiveStore, useMapStateStore, useShortcutStore } from '@/stores'
import { useSubscription } from '@vueuse/rxjs'
import { filter, finalize, switchMap, takeUntil, tap } from 'rxjs'
import { useMarkerPositionEdit } from './hooks'

const accessStore = useAccessStore()
const archiveStore = useArchiveStore()
const mapStateStore = useMapStateStore()
const shortcutStore = useShortcutStore()

// ==================== 移动点位 ====================
const {
  isMissionEmpty,
  isDraggingProcessing,
  draggingMission,
  loading,
  updateDragging,
  moveMarker,
  clearState,
} = useMarkerPositionEdit()

// ==================== 交互事件 ====================
const shortcutKeys = computed(() => {
  return archiveStore.currentArchive.body.Preference['app.shortcutKey.draggingMarker']
})

// 开始点位拖拽
useSubscription(shortcutStore.shortcut$.pipe(
  filter(({ value }) => {
    return [
      accessStore.get('MARKER_EDIT'),
      isMissionEmpty.value,
      shortcutKeys.value,
      value === shortcutKeys.value,
    ].every(Boolean)
  }),
).subscribe(() => {
  updateDragging(new Map())
}))

// 处理拖拽逻辑
useSubscription(MapSubject.dragStart.pipe(
  filter(({ info }) => [
    isDraggingProcessing.value,
    (info.layer?.constructor as (undefined | typeof Layer))?.layerName === GSMarkerLayer.layerName,
    info.object,
    info.viewport,
    !loading.value,
  ].every(Boolean)),

  switchMap(({ info, event: startEvent }) => {
    mapStateStore.setViewPortLocked(true)
    mapStateStore.setCursor('move')

    const { id: markerId, render } = info.object as GSMarkerInfo
    const { x: startX, y: startY } = startEvent.center
    const { zoom } = info.viewport!
    const [markerX, markerY] = draggingMission.value.get(markerId!) ?? render.position

    return MapSubject.drag.pipe(
      tap(({ event: moveEvent }) => {
        const scale = 2 ** -zoom
        const { x: moveX, y: moveY } = moveEvent.center
        const offsetX = (moveX - startX) * scale
        const offsetY = (moveY - startY) * scale
        const newDraggingMap = new Map(draggingMission.value)
        newDraggingMap.set(markerId!, [markerX + offsetX, markerY + offsetY])
        updateDragging(newDraggingMap)
      }),

      takeUntil(MapSubject.dragEnd),

      finalize(() => {
        mapStateStore.setTempMarkers('markerDragging', (() => {
          const markers: GSMarkerInfo[] = []
          draggingMission.value.forEach((_, markerId) => {
            const marker = mapStateStore.currentMarkerIdMap.get(markerId)
            marker && markers.push(marker)
          })
          return markers
        })())
        mapStateStore.setViewPortLocked(false)
        mapStateStore.setCursor()
      }),
    )
  }),
).subscribe())
</script>

<template>
  <div
    v-if="isDraggingProcessing"
    class="marker-move-controller"
  >
    <div class="mission-info">
      {{ draggingMission.size }}
    </div>
    <div class="controller-footer">
      <div>正在编辑点位坐标</div>
      <GSButton
        icon="submit"
        :disabled="!draggingMission.size"
        :loading="loading"
        @click="moveMarker"
      >
        确认
      </GSButton>
      <GSButton
        icon="cancel"
        :disabled="loading"
        @click="clearState"
      >
        取消
      </GSButton>
    </div>
  </div>
</template>

<style scoped>
@keyframes controller-info-anime-in {
  from { translate: 0 -200px; }
  to { translate: 0 0; }
}

@keyframes controller-footer-anime-in {
  from { translate: 0 200px; }
  to { translate: 0 0; }
}

.marker-move-controller {
  @apply
    absolute left-0 top-0 w-full h-full z-[10]
    text-[#ECE5D8] font-[HYWenHei-85W]
    pointer-events-none
  ;
}

.mission-info {
  @apply
    p-1 px-2
    absolute right-[8px] bottom-[96px] z-[10]
    text-sm rounded bg-[#252F39]
    pointer-events-auto
  ;
}

.controller-footer {
  @apply
    w-full py-6
    absolute bottom-0
    flex gap-4 items-center justify-center
    bg-[#252F39]
    pointer-events-auto
  ;
  animation: controller-footer-anime-in 150ms ease;
}
</style>
