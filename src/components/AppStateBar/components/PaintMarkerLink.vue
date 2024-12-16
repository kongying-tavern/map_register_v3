<script setup lang="ts">
import { useSubscription } from '@vueuse/rxjs'
import { Check, Close } from '@element-plus/icons-vue'
import { Subject, filter, finalize, map, race, repeat, switchMap, takeUntil, tap } from 'rxjs'
import { ElMessage } from 'element-plus'
import {
  IconMarkerLink,
  LinkActionLabel,
  LinkActionSelect,
  LinkGroupViewer,
  MarkerIndicatorLayer,
  MarkerInfo,
  useLinkWindow,
} from './MarkerLink'
import type { ModifyLinkOptions } from './MarkerLink'
import BarItem from './BarItem.vue'
import { useMapStateStore, useMarkerLinkStore, useMarkerStore } from '@/stores'
import { AppWindowTeleporter } from '@/components'
import {
  LINK_ACTION_CONFIG,
  LinkActionEnum,
  MapSubject,
  TempLayerIndex,
  mapContainerKey,
} from '@/shared'
import { GSLinkLayer, type GSMarkerInfo, GSMarkerLayer, type MarkerLinkMission } from '@/packages/map'
import { animate } from 'popmotion'

const mapStateStore = useMapStateStore()
const markerStore = useMarkerStore()
const markerLinkStore = useMarkerLinkStore()

const containerRef = inject(mapContainerKey, ref())

// ==================== 任务管理 ====================

const {
  isEnable,
  isProcessing,
  clear: clearMission,
  update,
} = mapStateStore.subscribeMission('markerLink', () => [])

// ==================== 窗口管理 ====================
const { start$, close$, info, toggle, close } = useLinkWindow()

// ==================== 表单状态 ====================

/** 关联类型 */
const linkAction = ref(LinkActionEnum.TRIGGER)

const actionColor = computed(() => LINK_ACTION_CONFIG[linkAction.value].lineColor)

/** 关联设置 */
const config = ref({
  /** 是否合并原关联组（如果有） */
  merge: true,
  /** 是否显示删除项 */
  showDelete: true,
})

// ==================== 内部状态 ====================

const floatCoord = ref<{ x: number; y: number }>()
const prevMarker = shallowRef<GSMarkerInfo>()
const nextMarker = shallowRef<GSMarkerInfo>()
const hoverMarker = shallowRef<GSMarkerInfo>()
const stopAnimation = ref<() => void>()
const hoverLink = shallowRef('')

/**
 * 正在编辑的关联项
 * - key 表示的意义
 * `${minId}-${maxId}-${action}`
 */
const modifyLinks = ref(new Map<string, ModifyLinkOptions>())

/** 删除关联 */
const deleteLink = (linkKey: string, options: ModifyLinkOptions) => {
  const currentLink = modifyLinks.value.get(linkKey)!
  if (!currentLink)
    return
  // 对于具有原始组的关联（即并非本地关联）需要添加为删除项而不是简单的从表中移除
  if (options.raw.groupId)
    modifyLinks.value.set(linkKey, { ...options, isDelete: true })
  // 对于本地项直接删除即可
  else
    modifyLinks.value.delete(linkKey)
  triggerRef(modifyLinks)
}

/** 将自动合并的关联提取为手动编辑 */
const extractLink = (linkKey: string, options: ModifyLinkOptions) => {
  modifyLinks.value.set(linkKey, {
    ...options,
    isMerge: false,
  })
  triggerRef(modifyLinks)
}

/** 恢复关联（仅针对含有原始组的关联） */
const revestLink = (linkKey: string, options: ModifyLinkOptions) => {
  const currentLink = modifyLinks.value.get(linkKey)!
  if (!currentLink || !options.raw.groupId)
    return
  modifyLinks.value.delete(linkKey)
}

/**
 * 受影响关联组（已在编辑数据中）
 * @note 根据 正在编辑的关联项 计算
 */
const containLinkGroups = computed(() => {
  const groupIds = new Set<string>()

  modifyLinks.value.forEach(({ raw, isMerge, isDelete }) => {
    if (isMerge || isDelete)
      return
    const fromMarker = markerStore.idMap.get(raw.fromId!)
    fromMarker?.linkageId && groupIds.add(fromMarker.linkageId)
    const toMarker = markerStore.idMap.get(raw.toId!)
    toMarker?.linkageId && groupIds.add(toMarker.linkageId)
  })

  const groups = new Map<string, Map<string, ModifyLinkOptions>>()

  groupIds.forEach((groupId) => {
    const links = markerLinkStore.groupIdMap.get(groupId)
    if (!links?.length)
      return
    groups.set(groupId, links.reduce((map, link) => {
      const { id, fromId, toId, linkAction } = link
      const isReverse = fromId! > toId!
      return map.set(
        isReverse
          ? `${toId}-${fromId}-${linkAction}`
          : `${fromId}-${toId}-${linkAction}`,
        { isDelete: false, isMerge: true, isReverse, raw: link, key: `${id}` },
      )
    }, new Map<string, ModifyLinkOptions>()))
  })

  return groups
})

/**
 * 受影响关联组（临时）
 * @note 根据当前选中点位计算
 */
const tempContainLinkGroups = computed(() => {
  const groups = new Map<string, Map<string, ModifyLinkOptions>>()
  void [prevMarker.value?.linkageId, nextMarker.value?.linkageId].forEach((groupId) => {
    if (!groupId || containLinkGroups.value.has(groupId))
      return
    const links = markerLinkStore.groupIdMap.get(groupId)
    if (!links?.length)
      return
    groups.set(groupId, links.reduce((map, link) => {
      const { id, fromId, toId, linkAction } = link
      const isReverse = fromId! > toId!
      return map.set(
        isReverse ? `${toId}-${fromId}-${linkAction}` : `${fromId}-${toId}-${linkAction}`,
        { isDelete: false, isMerge: true, isReverse, raw: link, key: `${id}` },
      )
    }, new Map<string, ModifyLinkOptions>()))
  })
  return groups
})

/**
 * 预处理关联项
 * @note 提交之前的结果预览
 */
const previewLinkGroups = computed(() => {
  const result = new Map<string, ModifyLinkOptions>()
  const { merge, showDelete } = config.value
  modifyLinks.value.forEach((link, key) => {
    if (link.isDelete && !showDelete)
      return
    result.set(key, link)
  })
  if (merge) {
    containLinkGroups.value.forEach((group) => {
      group.forEach((link, key) => {
        if (link.isDelete && !showDelete)
          return
        const isModifying = modifyLinks.value.get(key)
        if (isModifying && isModifying.isReverse === link.isReverse)
          return
        result.set(key, link)
      })
    })
  }
  return result
})

// ==================== 逻辑处理 ====================

const clearSelect = () => {
  mapStateStore.tempLayer.remove(TempLayerIndex.BeforeMarker)
  stopAnimation.value?.()
  mapStateStore.interaction.clearFocus()
  mapStateStore.setTempMarkers('markerLink', [])
  nextMarker.value = undefined
  prevMarker.value = undefined
}

const resumeOnceFocus = (data: number[]) => {
  mapStateStore.interaction.resumeFocus(GSMarkerLayer.layerName)
  mapStateStore.interaction.setFocus(GSMarkerLayer.layerName, new Set(data))
  mapStateStore.interaction.pauseFocus(GSMarkerLayer.layerName)
}

/** 悬浮指示器更新 */
useSubscription(start$.pipe(
  switchMap(() => MapSubject.hover.pipe(
    tap(({ info }) => {
      floatCoord.value = info.coordinate
        ? { x: info.x, y: info.y }
        : undefined
    }),
    takeUntil(race(close$, MapSubject.drag)),
    finalize(() => {
      floatCoord.value = undefined
    }),
    repeat(),
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
        const prev = prevMarker.value
        if (prev && nextMarker.value)
          return
        if (!markerInfo) {
          hoverMarker.value = undefined
          stopAnimation.value?.()
          return
        }
        if (markerInfo.id === hoverMarker.value?.id)
          return
        hoverMarker.value = markerInfo
        if (!prev
          || prev.id === markerInfo.id
          || nextMarker.value !== undefined
        ) {
          stopAnimation.value?.()
          return
        }
        const id = `temp-${crypto.randomUUID()}`
        stopAnimation.value?.()
        stopAnimation.value = animate<number>({
          from: 0,
          to: Math.PI,
          duration: 1000,
          repeat: Number.POSITIVE_INFINITY,
          onUpdate: (v) => {
            mapStateStore.tempLayer.set(TempLayerIndex.BeforeMarker, new GSLinkLayer({
              id: 'indicator',
              hoverIds: mapStateStore.interaction.hoverElements.get(GSLinkLayer.layerName) as Set<string> | undefined,
              outlineColor: [255, 255, 255, 255 - 255 * Math.sin(v)],
              data: [{
                id,
                from: prev.render.position,
                to: markerInfo.render.position,
                color: actionColor.value,
              }],
            }))
          },
          onStop: () => {
            mapStateStore.tempLayer.remove(TempLayerIndex.BeforeMarker)
            stopAnimation.value = undefined
          },
        }).stop
      }),

      takeUntil(close$),

      finalize(() => {
        stopAnimation.value?.()
        mapStateStore.tempLayer.remove(TempLayerIndex.BeforeMarker)
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

    // 初始化交互态
    mapStateStore.interaction.clearFocus()
    mapStateStore.interaction.pauseFocus(GSMarkerLayer.layerName)
    mapStateStore.interaction.setIsPopoverOnHover(true)

    return MapSubject.click.pipe(
      filter(({ event }) => Boolean(event.leftButton)),

      map(({ info }) => {
        // 如果点击信息为空，取消
        if (!info.layer
          || !GSMarkerLayer.isInstance(info.layer)
          || !info.object
          || prevMarker.value?.id === (info.object as GSMarkerInfo).id
        ) {
          clearSelect()
        }

        // 选择起始点
        else if (!prevMarker.value) {
          const markerInfo = info.object as GSMarkerInfo
          resumeOnceFocus([markerInfo.id!])
          mapStateStore.tempLayer.set(TempLayerIndex.BeforeMarker, new MarkerIndicatorLayer({
            id: 'marker-indicater',
            data: [markerInfo],
          }))
          mapStateStore.setTempMarkers('markerLink', [markerInfo])
          prevMarker.value = markerInfo
        }

        // 选择终止点
        else if (!nextMarker.value) {
          const markerInfo = info.object as GSMarkerInfo
          resumeOnceFocus([prevMarker.value.id!, markerInfo.id!])
          mapStateStore.tempLayer.set(TempLayerIndex.BeforeMarker, new MarkerIndicatorLayer({
            id: 'marker-indicater',
            data: [prevMarker.value, markerInfo],
          }))
          mapStateStore.tempLayer.set(TempLayerIndex.BeforeMarker, new GSLinkLayer({
            id: 'indicator',
            data: [{
              id: `temp-${crypto.randomUUID()}`,
              from: prevMarker.value.render.position,
              to: markerInfo.render.position,
              color: actionColor.value,
            }],
          }))
          mapStateStore.setTempMarkers('markerLink', [prevMarker.value, markerInfo])
          nextMarker.value = markerInfo
        }

        // 如果确认点击不为终止点，取消
        else if (nextMarker.value?.id !== (info.object as GSMarkerInfo).id) {
          clearSelect()
        }

        // 如果确认点击为终止点，发送结果
        else {
          return { prev: prevMarker.value!, next: nextMarker.value!, action: linkAction.value }
        }
      }),

      filter(result => result !== undefined),

      takeUntil(close$),

      finalize(() => {
        clearSelect()
        clearMission()
        mapStateStore.interaction.resumeFocus(GSMarkerLayer.layerName)
        mapStateStore.interaction.setIsPopoverOnHover(false)
        modifyLinks.value.clear()
      }),
    )
  }),
).subscribe(({ prev, next, action }) => {
  if (!prev.id || !next.id)
    return ElMessage.error('所选点位 id 字段为空')

  const isReverse = prev.id > next.id
  const linkKey = isReverse
    ? `${next.id}-${prev.id}-${action}`
    : `${prev.id}-${next.id}-${action}`

  modifyLinks.value.set(linkKey, {
    key: `temp-${crypto.randomUUID()}`,
    isReverse,
    isDelete: false,
    isMerge: false,
    raw: {
      fromId: prev.id,
      toId: next.id,
      linkAction: action,
    },
  })

  triggerRef(modifyLinks)

  clearSelect()
}))

/** 自动更新任务 */
useSubscription(start$.pipe(
  switchMap(() => {
    const paramsChange$ = new Subject<Map<string, ModifyLinkOptions>>()
    const stopWatch = watch(previewLinkGroups, (params) => {
      paramsChange$.next(params)
    })

    return paramsChange$.pipe(
      tap((groups) => {
        const result: MarkerLinkMission[] = []
        let index = 0
        groups.forEach(({ isDelete, raw, key }) => {
          index++
          if (isDelete)
            return
          result.push({
            meta: {
              key: raw.id ? `${raw.id}` : key,
            },
            toId: raw.toId,
            fromId: raw.fromId,
            linkAction: raw.linkAction,
          })
        })
        console.log('links', result)

        update(result)
      }),

      takeUntil(close$),
      finalize(() => {
        stopWatch()
      }),
    )
  }),
).subscribe())

onBeforeUnmount(() => clearMission())
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
          :class="!prevMarker
            ? 'text-[var(--el-color-success)]'
            : !nextMarker
              ? 'text-[var(--el-color-success)]'
              : 'text-[var(--el-color-warning)]'
          "
        >
          {{ !prevMarker ? '请选择起始点' : !nextMarker ? '请选择终止点' : '再次选择终止点以确认' }}
        </div>
      </div>
    </Teleport>

    <AppWindowTeleporter :info="info">
      <div
        class="
          w-full h-full overflow-hidden
          grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto] justify-items-center
          text-sm
        "
      >
        <div class="w-full h-full col-span-3 grid grid-cols-[1fr_auto_1fr] place-items-center">
          <MarkerInfo :marker="prevMarker" placeholder="起始点" />
          <LinkActionSelect v-model="linkAction" />
          <MarkerInfo :marker="nextMarker" placeholder="终止点" reverse />
        </div>

        <LinkGroupViewer
          title="修改前"
          :hover-link="hoverLink"
          :groups="containLinkGroups"
          :temp-groups="tempContainLinkGroups"
        />

        <div class="w-[1px] h-full bg-[var(--el-border-color)]" />

        <LinkGroupViewer
          title="修改后"
          :hover-link="hoverLink"
          :append-group="previewLinkGroups"
          @delete="(...args) => deleteLink(...args)"
          @extract="(...args) => extractLink(...args)"
          @revest="(...args) => revestLink(...args)"
        />

        <div class="w-full shrink-0 col-span-3 flex p-2">
          <div class="flex-1 flex gap-2">
            <el-switch
              v-model="config.merge"
              inline-prompt
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              active-text="合并原有关联"
              inactive-text="拆解原有关联"
            />
            <el-switch
              v-model="config.showDelete"
              inline-prompt
              active-text="显示删除项"
              inactive-text="隐藏删除项"
            />
          </div>

          <div class="shrink-0">
            <el-button :icon="Check">
              保存
            </el-button>
            <el-button :icon="Close" @click="close">
              取消
            </el-button>
          </div>
        </div>
      </div>
    </AppWindowTeleporter>
  </BarItem>
</template>
