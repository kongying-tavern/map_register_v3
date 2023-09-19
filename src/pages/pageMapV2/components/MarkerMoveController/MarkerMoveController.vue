<script lang="ts" setup>
import { filter, fromEvent, map, switchMap, takeUntil } from 'rxjs'
import { fromEvent as fromRefEvent, useSubscription } from '@vueuse/rxjs'
import { useMarkerPositionEdit } from './hooks'
import { useInteractionLayer, useMap } from '@/pages/pageMapV2/hooks'
import { isMarkerVo, isMovingMarker } from '@/utils'
import { useMapStore } from '@/stores'
import { GSButton } from '@/components'
import { genshinMapCanvasKey } from '@/pages/pageMapV2/shared'

const { map: mapInstance } = useMap()
const mapStore = useMapStore()
const canvasRef = inject(genshinMapCanvasKey) as Ref<HTMLCanvasElement>

// ==================== 界面控制 ====================
const controllerPanelVisible = computed(() => mapStore.mission?.type === 'moveMarkers')
const { visible: interactionVisible } = useInteractionLayer()
watch(controllerPanelVisible, (visible) => {
  interactionVisible.value = !visible
})

// ==================== 移动点位 ====================
const { moveMarker, loading, onSuccess } = useMarkerPositionEdit()

const clearState = () => {
  mapStore.clearMission()
  mapInstance.value?.baseLayer?.setState({
    movingMarkers: [],
  })
}

onSuccess(clearState)

const commitPositionChange = async () => {
  const missions = mapStore.getMission('moveMarkers') ?? []
  missions.length && await moveMarker(missions.map(({ origin, offset: [offsetX, offsetY] }) => {
    const [x, y] = origin.position!.split(',').map(Number)
    return {
      ...origin,
      position: `${x + offsetX},${y + offsetY}`,
    }
  }))
}

mapStore.$onAction((ctx) => {
  if (ctx.name !== 'setMission' || ctx.args[0] !== 'moveMarkers')
    return
  mapInstance.value?.baseLayer?.setState({
    movingMarkers: ctx.args[1] as { origin: API.MarkerVo; offset: API.Coordinate2D }[],
  })
})

// ==================== 交互事件组 ====================
const pointerdown = fromEvent<PointerEvent>(window, 'pointerdown').pipe(filter(() => {
  return controllerPanelVisible.value && (isMarkerVo(mapStore.hover) || isMovingMarker(mapStore.hover))
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
  mapStore.lockViewState = true

  const { x: startX, y: startY } = ev
  const { zoom } = mapInstance.value!.mainViewState

  const hover = mapStore.hover as API.MarkerVo | { origin: API.MarkerVo; offset: API.Coordinate2D }
  const markerinfo = isMarkerVo(hover) ? hover : hover.origin

  const markerMoveMission = mapStore.getMission('moveMarkers')!
  let currentMovingIndex = markerMoveMission.findIndex(mission => mission.origin.id === markerinfo.id)
  const currentMoving = markerMoveMission[currentMovingIndex] ?? {
    origin: markerinfo,
    offset: [0, 0] as API.Coordinate2D,
  }
  const [rawOffsetX, rawOffsetY] = currentMoving.offset

  return pointermove.pipe(
    map(({ x, y }) => {
      const scale = 2 ** -zoom
      const offsetX = (x - startX) * scale
      const offsetY = (y - startY) * scale
      if (currentMovingIndex < 0) {
        currentMovingIndex = markerMoveMission.length
        markerMoveMission.push(currentMoving)
      }
      markerMoveMission[currentMovingIndex].offset = [rawOffsetX + offsetX, rawOffsetY + offsetY]
      mapStore.setMission('moveMarkers', [...markerMoveMission])
    }),

    takeUntil(pointerup.pipe(map(() => {
      mapStore.lockViewState = false
    }))),
  )
}))
useSubscription(markerDragController.subscribe())

/** 热键控制 */
const panelVisibleController = dKeydown.pipe(switchMap(() => {
  mapStore.setMission('moveMarkers', [])
  return dKeyup.pipe(map(() => {
    const mission = mapStore.getMission('moveMarkers') ?? []
    !mission.length && clearState()
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
      <GSButton icon="submit" class="pointer-events-auto" :loading="loading" @click="commitPositionChange">
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
