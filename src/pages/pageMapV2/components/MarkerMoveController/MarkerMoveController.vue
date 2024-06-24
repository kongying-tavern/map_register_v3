<script lang="ts" setup>
import type { Observable } from 'rxjs'
import { filter, fromEvent, map, switchMap, takeUntil } from 'rxjs'
import { fromEvent as fromRefEvent, useSubscription } from '@vueuse/rxjs'
import { useMarkerPositionEdit } from './hooks'
import { useInteractionLayer } from '@/pages/pageMapV2/hooks'
import { useMapStateStore } from '@/stores'
import { GSButton } from '@/components'
import { genshinMapCanvasKey } from '@/pages/pageMapV2/shared'

const mapStateStore = useMapStateStore()

const canvasRef = inject(genshinMapCanvasKey) as Ref<HTMLCanvasElement>

// ==================== 移动点位 ====================
const { hasHover, hoverElements } = mapStateStore

const hoverMarker = computed(() => {
  if (!hasHover('marker'))
    return
  const set = hoverElements.get('marker')!
  return mapStateStore.currentMarkerIdMap.get(set.values().next().value)
})

const {
  isMissionEmpty,
  isDraggingProcessing,
  draggingMission,
  loading,
  updateDragging,
  updateDraggingBy,
  moveMarker,
  clearState,
} = useMarkerPositionEdit()

// ==================== 界面控制 ====================
const { visible: interactionVisible } = useInteractionLayer()
watch(isDraggingProcessing, (visible) => {
  interactionVisible.value = !visible
})

// ==================== 交互事件 ====================
const pointerdown = fromEvent<PointerEvent>(window, 'pointerdown')
const pointermove = fromEvent<PointerEvent>(window, 'pointermove')
const pointerup = fromEvent<PointerEvent>(window, 'pointerup')
const dKeyPress = fromRefEvent(canvasRef, 'keypress') as Observable<KeyboardEvent>

/** 点位拖拽 */
useSubscription(pointerdown.pipe(
  filter((ev) => {
    return [
      // TODO 暂时屏蔽带功能键的操作
      !ev.ctrlKey,
      !ev.altKey,
      isDraggingProcessing.value,
      Boolean(hoverMarker.value),
    ].every(condition => condition)
  }),

  switchMap((ev) => {
    mapStateStore.setViewPortLocked(true)

    const marker = hoverMarker.value!
    const { x: startX, y: startY } = ev
    const { zoom } = mapStateStore.viewState
    const [markerX, markerY] = draggingMission.value[marker.id!] ?? marker.render.position

    return pointermove.pipe(
      map(({ x, y }) => {
        const scale = 2 ** -zoom
        const offsetX = (x - startX) * scale
        const offsetY = (y - startY) * scale
        updateDragging({
          ...draggingMission.value,
          [marker.id!]: [markerX + offsetX, markerY + offsetY],
        })
      }),
      takeUntil(pointerup.pipe(map(() => {
        updateDraggingBy((current, setter) => {
          setter(current)
          if (marker.render.isTemporary) {
            mapStateStore.setTempMarkersBy('markerDragging', (oldTemp, setTemp) => {
              if (!marker.render.isTemporary || oldTemp.find(({ id }) => marker.id === id))
                return
              setTemp([...oldTemp, marker])
            })
          }
          mapStateStore.setViewPortLocked(false)
        })
      }))),
    )
  }),
).subscribe())

/** 热键激活 */
useSubscription(dKeyPress.pipe(
  filter(ev => isMissionEmpty.value && ev.code === 'KeyD'),
  map(() => updateDragging({})),
).subscribe())
</script>

<template>
  <div
    v-if="isDraggingProcessing"
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
      <GSButton icon="submit" class="pointer-events-auto" :disabled="!Object.keys(draggingMission).length" :loading="loading" @click="moveMarker">
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
