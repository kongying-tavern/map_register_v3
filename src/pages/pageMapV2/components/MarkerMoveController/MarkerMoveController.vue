<script lang="ts" setup>
import { filter, fromEvent, map, switchMap, takeUntil } from 'rxjs'
import { fromEvent as fromRefEvent, useSubscription } from '@vueuse/rxjs'
import { useMarkerPositionEdit } from './hooks'
import { useInteractionLayer } from '@/pages/pageMapV2/hooks'
import { useMapStateStore } from '@/stores'
import { GSButton } from '@/components'
import { genshinMapCanvasKey } from '@/pages/pageMapV2/shared'
import type { GSMapState } from '@/stores/types/genshin-map-state'

const mapStateStore = useMapStateStore()

const canvasRef = inject(genshinMapCanvasKey) as Ref<HTMLCanvasElement>

// ==================== 界面控制 ====================
const controllerPanelVisible = computed(() => mapStateStore.mission?.type === 'markerDragging')
const { visible: interactionVisible } = useInteractionLayer()
watch(controllerPanelVisible, (visible) => {
  interactionVisible.value = !visible
})

// ==================== 移动点位 ====================
const { loading, moveMarker, clearState } = useMarkerPositionEdit()

// ==================== 交互事件组 ====================
const pointerdown = fromEvent<PointerEvent>(window, 'pointerdown').pipe(filter(() => {
  return controllerPanelVisible.value && Boolean(mapStateStore.hover?.type === 'defaultMarker')
}))
const pointermove = fromEvent<PointerEvent>(window, 'pointermove')
const pointerup = fromEvent<PointerEvent>(window, 'pointerup')
const dKeydown = fromRefEvent(canvasRef, 'keydown').pipe(filter((ev) => {
  return (ev as KeyboardEvent).code === 'KeyD' && !controllerPanelVisible.value
}))
const dKeyup = fromEvent<KeyboardEvent>(window, 'keyup').pipe(filter((ev) => {
  return ev.code === 'KeyD'
}))

/** 点位拖拽控制 */
const markerDragController = pointerdown.pipe(switchMap((ev) => {
  mapStateStore.setViewPortLocked(true)

  const { x: startX, y: startY } = ev
  const { zoom } = mapStateStore.viewState

  const marker = mapStateStore.hover!.value as GSMapState.MarkerWithRenderConfig
  const markerDragMission = { ...(mapStateStore.mission!.value as Record<number, API.Coordinate2D>) }

  if (!markerDragMission[marker.id!])
    markerDragMission[marker.id!] = marker.render.position

  const [markerX, markerY] = markerDragMission[marker.id!]

  return pointermove.pipe(
    map(({ x, y }) => {
      const scale = 2 ** -zoom
      const offsetX = (x - startX) * scale
      const offsetY = (y - startY) * scale
      markerDragMission[marker.id!] = [markerX + offsetX, markerY + offsetY]
      mapStateStore.setMission({ type: 'markerDragging', value: markerDragMission })
    }),

    takeUntil(pointerup.pipe(map(() => {
      mapStateStore.setViewPortLocked(false)
    }))),
  )
}))
useSubscription(markerDragController.subscribe())

/** 热键控制 */
const panelVisibleController = dKeydown.pipe(switchMap(() => {
  mapStateStore.setMission({ type: 'markerDragging', value: [] })
  return dKeyup.pipe(map(() => {
    if (mapStateStore.mission?.type !== 'markerDragging')
      return
    !Object.keys(mapStateStore.mission.value).length && clearState()
  }))
}))
useSubscription(panelVisibleController.subscribe())
</script>

<template>
  <div
    v-if="controllerPanelVisible"
    class="marker-move-controller absolute left-0 top-0 w-full h-full"
  >
    <div class="controller-header absolute top-6 w-full flex items-center justify-center">
      <el-alert
        :closable="false"
        style="width: fit-content"
      >
        拖动点位来进行移动
      </el-alert>
    </div>

    <div class="controller-footer absolute bottom-6 w-full flex gap-4 items-center justify-center">
      <GSButton icon="submit" class="pointer-events-auto" :loading="loading" @click="moveMarker">
        确认
      </GSButton>
      <GSButton icon="cancel" class="pointer-events-auto" :disabled="loading" @click="clearState">
        取消
      </GSButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marker-move-controller {
  z-index: 1;
}

.controller-header {
  @keyframes header-anime-in {
    from { translate: 0 -200px; }
    to { translate: 0 0; }
  }
  animation: header-anime-in 150ms ease;
}

.controller-footer {
  @keyframes footer-anime-in {
    from { translate: 0 200px; }
    to { translate: 0 0; }
  }
  animation: footer-anime-in 150ms ease;
}
</style>
