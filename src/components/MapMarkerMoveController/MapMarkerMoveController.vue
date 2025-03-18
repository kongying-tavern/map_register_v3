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
  <Transition name="draw-y" appear mode="in-out">
    <div v-if="isDraggingProcessing" class="marker-move-controller">
      <div class="controller-info-bar">
        <div class="flex-1 text-center">
          <div>正在编辑点位坐标</div>
          <div class="text-xs">
            共移动 {{ draggingMission.size }} 项
          </div>
        </div>

        <div class="flex gap-2">
          <GSButton
            icon="submit"
            size="small"
            :disabled="!draggingMission.size"
            :loading="loading"
            @click="moveMarker"
          >
            确定
          </GSButton>
          <GSButton
            icon="cancel"
            size="small"
            :disabled="loading"
            @click="clearState"
          >
            取消
          </GSButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.marker-move-controller {
  @apply
    absolute left-0 top-0 w-full h-full z-[10]
    text-[#ECE5D8] font-[HYWenHei-85W]
    pointer-events-none
  ;
}

.controller-info-bar {
  @apply
    w-1/2 min-w-[360px] max-w-full py-4 px-4 rounded-lg shadow-2xl
    absolute left-1/2 top-0 sm:translate-y-4
    -translate-x-1/2 translate-y-[80px]
    flex gap-4 justify-between items-center
    bg-[#252F39]
    outline outline-1 outline-[gray] -outline-offset-4
    pointer-events-auto
  ;
}
</style>
