<script setup lang="ts">
import type { PickingInfo } from '@deck.gl/core/typed'
import BarItem from './BarItem.vue'
import { useMapStateStore } from '@/stores'
import { MapWindowTeleporter, mapWindowContext as context } from '@/pages/pageMapV2/components'
import { GSMarkerLayer } from '@/pages/pageMapV2/core/layer'
import type { GSMapState } from '@/stores/types/genshin-map-state'

const mapStateStore = useMapStateStore()

const {
  isEnable,
  isProcessing,
  data: linkList,
  update: setMarkerLink,
  clear,
  onClear,
} = mapStateStore.subscribeMission('markerLink', () => [])

const { data: markerOnHover } = mapStateStore.subscribeInteractionInfo('hover', 'defaultMarker')

const { pause: pauseFocus, resume: resumeFocus, update: setMarkerFocus } = mapStateStore.subscribeInteractionInfo('focus', 'defaultMarker')

const buildLinkKey = ({ fromId = 0, toId = 0, linkAction }: { fromId?: number; toId?: number; linkAction?: string }) => {
  return `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}-${linkAction}`
}

const triggerMarkerId = ref<number>()
const addMarkerLink = (markerLink: {
  fromId: number
  toId: number
  linkAction: GSMapState.MLRenderUnit['type']
}) => {
  const key = buildLinkKey(markerLink)

  const list = [...linkList.value]

  const tripleTupleIndex = list.findIndex(link => buildLinkKey(link) === key)

  if (tripleTupleIndex > -1)
    list.splice(tripleTupleIndex, 1, markerLink)
  else
    list.push(markerLink)

  mapStateStore.setMLRenderList(list.map(({ fromId, linkAction, toId }) => ({
    source: fromId!,
    target: toId!,
    type: linkAction as GSMapState.MLRenderUnit['type'],
  })))

  setMarkerLink(list)
  triggerMarkerId.value = undefined
}

const handleMapClick = (info: PickingInfo, event: { leftButton?: boolean }) => {
  // 确认是否处于点位关联任务中
  if (!isProcessing.value)
    return

  // 确认点击对象是否为点位
  if (!event.leftButton || !(info.sourceLayer instanceof GSMarkerLayer))
    return

  // 去重
  if (triggerMarkerId.value === info.object)
    return

  // 当没有源点时，设置源点
  if (triggerMarkerId.value === undefined) {
    triggerMarkerId.value = info.object as number
    return
  }

  // 当已有源点时，将源点和目标点加入到关联列表
  // TODO 在这之前需要先选择 linkAction
  addMarkerLink({
    fromId: triggerMarkerId.value,
    toId: info.object as number,
    linkAction: 'TRIGGER',
  })
}

onClear(() => {
  resumeFocus()
  mapStateStore.setIsPopoverOnHover(false)
  mapStateStore.setMLRenderList([])
  mapStateStore.event.off('click', handleMapClick)
})

const id = 'marker-link'
const toggleMarkerLink = async () => {
  if (isProcessing.value) {
    context.closeWindow(id)
    return
  }
  mapStateStore.event.on('click', handleMapClick)
  setMarkerFocus(null)
  pauseFocus()
  mapStateStore.setIsPopoverOnHover(true)
  setMarkerLink([])
  context.openWindow({ id, name: '点位关联' })
}

const prefix = crypto.randomUUID()
</script>

<template>
  <BarItem
    label="点位关联"
    class="grid place-content-center place-items-center"
    :disabled="!isEnable"
    @click="toggleMarkerLink"
  >
    <el-icon :size="20">
      <svg class="icon" viewBox="0 0 1024 1024" :fill="isProcessing ? '#00FF00' : 'currentColor'">
        <defs>
          <g :id="`${prefix}-a`" transform="translate(-72 -72)">
            <path d="M861.866667 164.266667c-87.466667-87.466667-230.4-89.6-320-2.133334l-68.266667 68.266667c-12.8 12.8-12.8 32 0 44.8s32 12.8 44.8 0l68.266667-68.266667c64-61.866667 166.4-61.866667 230.4 2.133334 64 64 64 168.533333 2.133333 232.533333l-117.333333 119.466667c-34.133333 34.133333-81.066667 51.2-128 49.066666-46.933333-4.266667-91.733333-27.733333-119.466667-66.133333-10.666667-14.933333-29.866667-17.066667-44.8-6.4-14.933333 10.666667-17.066667 29.866667-6.4 44.8 40.533333 53.333333 100.266667 87.466667 166.4 91.733333h17.066667c59.733333 0 119.466667-23.466667 162.133333-68.266666l117.333333-119.466667c83.2-89.6 83.2-234.666667-4.266666-322.133333z" />
            <path d="M505.6 750.933333l-66.133333 68.266667c-64 61.866667-166.4 61.866667-230.4-2.133333-64-64-64-168.533333-2.133334-232.533334l117.333334-119.466666c34.133333-34.133333 81.066667-51.2 128-49.066667 46.933333 4.266667 91.733333 27.733333 119.466666 66.133333 10.666667 14.933333 29.866667 17.066667 44.8 6.4 14.933333-10.666667 17.066667-29.866667 6.4-44.8-40.533333-53.333333-100.266667-87.466667-166.4-91.733333-66.133333-4.266667-130.133333 19.2-177.066666 66.133333l-117.333334 119.466667c-85.333333 89.6-85.333333 234.666667 2.133334 322.133333 44.8 44.8 102.4 66.133333 162.133333 66.133334 57.6 0 115.2-21.333333 160-64l66.133333-68.266667c12.8-12.8 12.8-32 0-44.8-14.933333-10.666667-34.133333-10.666667-46.933333 2.133333z" />
          </g>
          <g :id="`${prefix}-b`">
            <path d="M767.54821 543.725562c0-17.662265-14.3181-31.980365-31.980365-31.980365L287.843754 511.745197c-17.662265 0-31.980365 14.3181-31.980365 31.980365l0 0c0 17.662265 14.3181 31.980365 31.980365 31.980365l447.724091 0C753.23011 575.705927 767.54821 561.387827 767.54821 543.725562L767.54821 543.725562z" />
            <path d="M511.706311 287.88264c-17.662265 0-31.980365 14.3181-31.980365 31.980365l0 447.724091c0 17.662265 14.3181 31.980365 31.980365 31.980365l0 0c17.662265 0 31.980365-14.3181 31.980365-31.980365L543.686676 319.863005C543.686676 302.20074 529.368576 287.88264 511.706311 287.88264L511.706311 287.88264z" />
          </g>
          <mask :id="`${prefix}-c`">
            <g>
              <rect x="0" y="0" width="1024" height="1024" fill="#fff" />
              <use :href="`#${prefix}-b`" fill="#000" stroke="#000" stroke-width="20%" transform="translate(200 166)" />
            </g>
          </mask>
        </defs>
        <use :href="`#${prefix}-a`" :mask="`url(#${prefix}-c)`" />
        <use :href="`#${prefix}-b`" transform="translate(200 166)" />
      </svg>
    </el-icon>

    <MapWindowTeleporter :id="id" @close="clear">
      <div class="w-[400px] flex-col">
        <div class="border border-red-600 p-1">
          <div class="flex justify-between items-center">
            <div class="flex-1 text-center">
              {{ triggerMarkerId === undefined
                ? '<选择源点>'
                : !mapStateStore.currentLayerMarkersMap[triggerMarkerId]
                  ? 'Error'
                  : `${mapStateStore.currentLayerMarkersMap[triggerMarkerId].markerTitle} (id: ${triggerMarkerId})`
              }}
            </div>
            <div class="text-center">
              →
            </div>
            <div class="flex-1 text-center">
              {{ triggerMarkerId === undefined
                ? '<选择目标点>'
                : markerOnHover
                  ? markerOnHover.id === triggerMarkerId
                    ? '<选择目标点>'
                    : !mapStateStore.currentLayerMarkersMap[triggerMarkerId]
                      ? 'Error'
                      : `${mapStateStore.currentLayerMarkersMap[triggerMarkerId].markerTitle} (id: ${markerOnHover.id})`
                  : '<选择目标点>'
              }}
            </div>
          </div>
        </div>

        <div class="flex-1">
          <div v-for="singleLink in linkList" :key="buildLinkKey(singleLink)">
            {{ `${mapStateStore.currentLayerMarkersMap[singleLink.fromId ?? -1]?.markerTitle} (id: ${singleLink.fromId})` }}
            →
            {{ `${mapStateStore.currentLayerMarkersMap[singleLink.toId ?? -1]?.markerTitle} (id: ${singleLink.toId})` }}
          </div>
        </div>
      </div>
    </MapWindowTeleporter>
  </BarItem>
</template>
