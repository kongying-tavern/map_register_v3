<script setup lang="ts">
import { useSubscription } from '@vueuse/rxjs'
import { Subject, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs'
import {
  IconMarkerLink,
  LinkActionLabel,
  LinkActionSelect,
  LinkerIndicatorLayer,
  MarkerIndicatorLayer,
  MarkerInfo,
} from './MarkerLink'
import BarItem from './BarItem.vue'
import { useMapStateStore } from '@/stores'
import { AppWindowTeleporter, useAppWindow } from '@/components'
import {
  LINK_ACTION_CONFIG,
  LinkActionEnum,
  MapSubject,
  TempLayerIndex,
  globalPointerMove$,
  mapContainerKey,
} from '@/shared'
import { type GSMarkerInfo, GSMarkerLayer } from '@/packages/map'

const mapStateStore = useMapStateStore()
const containerRef = inject(mapContainerKey, ref())

const {
  isEnable,
  isProcessing,
  clear: clearMission,
  update,
} = mapStateStore.subscribeMission('markerLink', () => [])

const start$ = new Subject<void>()
const close$ = new Subject<void>()

const { info, toggle } = useAppWindow({
  name: '点位关联',
  beforeOpen: () => {
    start$.next()
    return true
  },
  beforeClose: () => {
    close$.next()
    return true
  },
})

const linkAction = ref(LinkActionEnum.TRIGGER)
const floatCoord = ref<{ x: number; y: number }>()
const prevMarker = shallowRef<GSMarkerInfo>()
const nextMarker = shallowRef<GSMarkerInfo>()
const hoverMarker = shallowRef<GSMarkerInfo>()

const clearSelect = () => {
  mapStateStore.tempLayer.remove(TempLayerIndex.BeforeMarker)
  mapStateStore.interaction.clearFocus()
  nextMarker.value = undefined
  prevMarker.value = undefined
}

const resumeOnceFocus = (data: number[]) => {
  mapStateStore.interaction.resumeFocus(GSMarkerLayer.layerName)
  mapStateStore.interaction.setFocus(GSMarkerLayer.layerName, new Set(data))
  mapStateStore.interaction.pauseFocus(GSMarkerLayer.layerName)
}

/** 悬浮指示器更新逻辑 */
useSubscription(start$.pipe(
  switchMap(() => globalPointerMove$.pipe(
    tap(({ x, y }) => {
      floatCoord.value = { x, y }
    }),
    takeUntil(close$),
  )),
).subscribe())

/** hover 逻辑 */
useSubscription(start$.pipe(
  switchMap(() => {
    return MapSubject.hover.pipe(
      map(({ info }) => {
        if (!info.layer
          || !GSMarkerLayer.isInstance(info.layer)
          || !info.object
        )
          return undefined
        return info.object as GSMarkerInfo
      }),

      tap((markerInfo) => {
        if (!markerInfo) {
          hoverMarker.value = undefined
          mapStateStore.tempLayer.remove(TempLayerIndex.AfterMarker)
          return
        }
        if (markerInfo.id === hoverMarker.value?.id)
          return
        hoverMarker.value = markerInfo
        if (!prevMarker.value
          || prevMarker.value.id === markerInfo.id
          || nextMarker.value !== undefined
        ) {
          mapStateStore.tempLayer.remove(TempLayerIndex.AfterMarker)
          return
        }
        mapStateStore.tempLayer.set(TempLayerIndex.AfterMarker, 'marker-link-indicator', new LinkerIndicatorLayer({
          from: prevMarker.value,
          to: markerInfo,
          color: LINK_ACTION_CONFIG[linkAction.value].lineColor,
        }))
      }),

      takeUntil(close$),

      finalize(() => {
        mapStateStore.tempLayer.remove(TempLayerIndex.AfterMarker)
      }),
    )
  }),
).subscribe())

/**
 * click 逻辑
 * 1. 选择源点
 * 2. 选择目标点
 * 3. 再次选择目标点以确认
 */
useSubscription(start$.pipe(
  switchMap(() => {
    update([])
    mapStateStore.interaction.clearFocus()
    mapStateStore.interaction.pauseFocus(GSMarkerLayer.layerName)
    mapStateStore.interaction.setIsPopoverOnHover(true)

    return MapSubject.click.pipe(
      filter(({ event }) => Boolean(event.leftButton)),

      map(({ info }) => {
        if (!info.layer
          || !GSMarkerLayer.isInstance(info.layer)
          || !info.object
          || prevMarker.value?.id === (info.object as GSMarkerInfo).id
        ) {
          clearSelect()
        }

        else if (!prevMarker.value) {
          const markerInfo = info.object as GSMarkerInfo
          resumeOnceFocus([markerInfo.id!])
          mapStateStore.tempLayer.set(TempLayerIndex.BeforeMarker, 'marker-indicater', new MarkerIndicatorLayer({
            data: [markerInfo],
          }))
          prevMarker.value = markerInfo
        }

        else if (!nextMarker.value) {
          const markerInfo = info.object as GSMarkerInfo
          resumeOnceFocus([prevMarker.value.id!, markerInfo.id!])
          mapStateStore.tempLayer.set(TempLayerIndex.BeforeMarker, 'marker-indicater', new MarkerIndicatorLayer({
            data: [prevMarker.value, markerInfo],
          }))
          mapStateStore.tempLayer.remove(TempLayerIndex.AfterMarker)
          nextMarker.value = markerInfo
        }

        else if (nextMarker.value?.id !== (info.object as GSMarkerInfo).id) {
          clearSelect()
        }

        else {
          return { prev: prevMarker.value!, next: nextMarker.value! }
        }
      }),

      filter(result => result !== undefined),

      takeUntil(close$),

      finalize(() => {
        clearSelect()
        clearMission()
        mapStateStore.interaction.resumeFocus(GSMarkerLayer.layerName)
        mapStateStore.interaction.setIsPopoverOnHover(false)
      }),
    )
  }),
).subscribe(({ prev, next }) => {
  clearSelect()
  console.log({ prev, next })
}))

onBeforeUnmount(() => {
  clearMission()
})
</script>

<template>
  <BarItem
    label="点位关联"
    class="grid place-content-center place-items-center"
    divider
    :disabled="!isEnable"
    @click="toggle"
  >
    <ElIcon :size="20" :color="isProcessing ? '#00FF00' : 'currentColor'">
      <IconMarkerLink />
    </ElIcon>

    <Teleport v-if="isProcessing && containerRef && floatCoord" :to="containerRef">
      <div
        class="
          w-[160px] p-1 rounded
          absolute left-0 top-0 z-[1000]
          bg-[var(--el-bg-color)]
          border border-[var(--el-border-color)]
          text-[var(--el-text-color-regular)] text-sm
          pointer-events-none
        "
        :style="{ transform: `translate(${floatCoord.x + 30}px, ${floatCoord.y}px)` }"
      >
        <div>
          当前关联类型
        </div>
        <LinkActionLabel :value="linkAction" class="bg-[var(--el-fill-color)] p-1" />
        <div
          :class="!prevMarker ? 'text-[var(--el-color-success)]' : !nextMarker ? 'text-[var(--el-color-success)]' : 'text-[var(--el-color-warning)]'"
        >
          {{ !prevMarker ? '请选择起始点' : !nextMarker ? '请选择终止点' : '再次选择终止点以确认' }}
        </div>
      </div>
    </Teleport>

    <AppWindowTeleporter :info="info">
      <div
        class="
          w-full h-full overflow-hidden
          grid grid-cols-2 grid-rows-[auto_1fr_auto] justify-items-center
          text-sm
        "
      >
        <div class="shrink-0 col-span-2 grid grid-cols-[1fr_auto_1fr] place-items-center">
          <MarkerInfo :marker="prevMarker" placeholder="起始点" />
          <LinkActionSelect v-model="linkAction" />
          <MarkerInfo :marker="nextMarker" placeholder="终止点" />
        </div>

        <div class="">
          左侧信息
        </div>

        <div class="">
          右侧信息
        </div>

        <div class="shrink-0 col-span-2">
          底部操作栏
        </div>
      </div>
    </AppWindowTeleporter>
  </BarItem>
</template>
