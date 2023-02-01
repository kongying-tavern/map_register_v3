<script lang="ts" setup>
import { EditPen, FullScreen, Location, Minus, Place, Search } from '@element-plus/icons-vue'
import type { Directive } from 'vue'
import { ElMessage } from 'element-plus'
import type L from 'leaflet'
import { FilterArea, FilterItem, FilterStep, FilterType, MarkersTable } from '@/pages/pageMap/components'
import { localSettings, useMapStore } from '@/stores'
import { mapInjection } from '@/pages/pageMap/shared'
import Api from '@/api/api'
import { createLinkMarker, useMarker } from '@/pages/pageMap/hooks'
import { sleep } from '@/utils'

defineProps<{
  markerLoading?: boolean
  itemLoading?: boolean
}>()

const mapStore = useMapStore()
const map = inject(mapInjection, ref(null))

const { markerList, createMarkerWhenReady } = useMarker({
  immediate: false,
})

/** tab 的可用标签，仅控制视图，无业务逻辑 */
const steps = ['选择地区', '选择分类', '选择物品']

/** tab 过渡动画的名称，可用过渡在 src/style/transition */
const transitionAnimationName = ref('slide-x-r')
watch(() => mapStore.step, (newStep = 0, oldStep = 0) => {
  transitionAnimationName.value = newStep > oldStep ? 'slide-x-r' : 'slide-x-l'
})

/** 是否自动切换下一步筛选项 */
const autoNextStep = ref(false)
const next = (v?: string | number) => {
  if (v === undefined || !autoNextStep.value)
    return
  if (mapStore.step === undefined) {
    mapStore.step = 0
    return
  }
  mapStore.step < steps.length - 1 && (mapStore.step += 1)
}

/** 控制面板是否最小化 */
const minus = ref(false)

/** 查询并跳转到对应 ID 的点位 */
const queryMarkerId = ref<number>()
const formatInput = computed({
  get: () => `${queryMarkerId.value ?? ''}`,
  set: (v) => {
    if (!v)
      queryMarkerId.value = undefined
    const num = parseInt(v)
    if (isNaN(num))
      return
    queryMarkerId.value = num
  },
})

const flyToMarker = (params: { id?: number; punctuateId?: number }) => {
  if (!map.value)
    return

  const { id, punctuateId } = params

  // TODO _layers 是私有属性
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layers = (map.value as any)._layers as Record<string, L.Marker>

  /** 查询到点位 */
  for (const key in layers) {
    const marker = layers[key]
    // layers 继承自 L.Layer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { markerId, punctuateId: markerPunctuateId } = (marker as any).options?.img ?? {}
    if ((markerId && markerId === id) || (markerPunctuateId && markerPunctuateId === punctuateId)) {
      map.value.closePopup()
      const { lat, lng } = marker.getLatLng()
      map.value.flyTo([lat - 200, lng], 0, {
        animate: false,
      })
      marker.fire('click')
      break
    }
  }
}

/** 临时点位 */
const tempMarker = ref<API.MarkerVo | null>(null)

const clearTempMarker = () => {
  if (!tempMarker.value)
    return
  const findIndex = markerList.value.findIndex(marker => marker.id === tempMarker.value?.id)
  if (findIndex < 0) {
    tempMarker.value = null
    return
  }
  markerList.value.splice(findIndex, 1)
}

// TODO 封装为组件
const searchMarker = async () => {
  clearTempMarker()
  if (!map.value || !queryMarkerId.value) {
    createMarkerWhenReady()
    return
  }
  // 优先搜索当前已加载点位
  const res = markerList.value.find(marker => marker.id === queryMarkerId.value)
  if (res) {
    flyToMarker({ id: queryMarkerId.value })
    return
  }
  // 远程搜索
  const { data = [] } = await Api.marker.listMarkerById({}, [queryMarkerId.value])
  if (!data.length) {
    ElMessage.error('找不到该点位')
    return
  }
  // 点位不存在时直接创建临时点位
  tempMarker.value = data[0]
  const markervo = createLinkMarker(data[0])
  markerList.value.push(markervo)
  // 临时终止移动到点集中心
  const tempState = localSettings.value.moveToCenter
  localSettings.value.moveToCenter = false
  createMarkerWhenReady()
  await sleep(100)
  flyToMarker({ id: queryMarkerId.value })
  localSettings.value.moveToCenter = tempState
}

const tooltipContent = ref('')
const tooltipTarget = ref<HTMLElement | undefined>(undefined)
const tooltipVisible = ref(false)

const vTooltip: Directive<HTMLElement, string> = {
  mounted: (el, binding) => {
    el.addEventListener('mouseover', (ev) => {
      tooltipContent.value = binding.value
      tooltipTarget.value = ev.currentTarget as HTMLElement
    })
  },
}

const activeColor = 'rgb(40 40 40 / 0.3)'
const inactiveColor = 'rgb(120 120 120 / 0.3)'
</script>

<template>
  <div class="left-control-panel" :class="{ minus }" v-bind="$attrs">
    <div class="w-full flex gap-2">
      <div
        class="content grid place-items-center aspect-square cursor-pointer hover:brightness-125"
        :style="{ width: 'auto' }"
        :title="minus ? '展开' : '折叠'"
        @click="(minus = !minus)"
      >
        <el-icon>
          <Minus v-if="!minus" />
          <FullScreen v-else />
        </el-icon>
      </div>
      <FilterStep
        v-model="mapStore.step"
        :step-names="steps"
        class="content flex-1"
      />
      <div class="content px-2 flex justify-center items-center gap-1" title="满足条件时自动进入下一个选择器">
        <div class="text-xs leading-none">
          auto
          <br>
          next
        </div>
        <el-switch v-model="autoNextStep" />
      </div>
    </div>

    <div class="content">
      <Transition :name="transitionAnimationName" mode="out-in" appear>
        <KeepAlive>
          <FilterArea v-if="(mapStore.step === 0)" v-model="mapStore.areaCode" class="h-full" @change="next" />

          <div v-else-if="mapStore.areaCode === undefined" class="h-full grid place-items-center text-white">
            <el-button link type="primary" @click="(mapStore.step = 0)">
              请选择地区
            </el-button>
          </div>

          <FilterType v-else-if="(mapStore.step === 1)" v-model="mapStore.typeId" class="h-full" @change="next" />

          <div v-else-if="!mapStore.typeId" class="h-full grid place-items-center text-white">
            <el-button link type="primary" @click="(mapStore.step = 1)">
              请选择分类
            </el-button>
          </div>

          <FilterItem v-else-if="(mapStore.step === 2)" v-model="mapStore.iconName" :loading="itemLoading" class="h-full" />
        </KeepAlive>
      </Transition>
    </div>

    <div class="w-full flex gap-2">
      <el-tooltip
        v-model:visible="tooltipVisible"
        :content="tooltipContent"
        :virtual-ref="tooltipTarget"
        trigger="hover"
        placement="top"
        virtual-triggering
      />

      <el-button-group>
        <el-button
          v-tooltip="'显示审核中点位'"
          :icon="EditPen"
          :color="mapStore.showPunctuateMarker ? activeColor : inactiveColor"
          dark
          @click="mapStore.showPunctuateMarker = !mapStore.showPunctuateMarker"
        />
        <el-button
          v-tooltip="'显示审核通过点位'"
          :icon="Location"
          :color="mapStore.showAuditedMarker ? activeColor : inactiveColor"
          dark
          @click="mapStore.showAuditedMarker = !mapStore.showAuditedMarker"
        />
        <el-button
          v-tooltip="'仅显示地下点位'"
          :color="mapStore.onlyUnderground ? activeColor : inactiveColor"
          :icon="Place"
          dark
          @click="mapStore.onlyUnderground = !mapStore.onlyUnderground"
        />
      </el-button-group>
      <div>
        <el-input v-model="formatInput" placeholder="请输入点位ID" input-style="width:100px" class="h-full" @clear="searchMarker" @keydown.enter="searchMarker">
          <template #append>
            <el-button v-tooltip="'跳转到指定ID点位'" :icon="Search" @click="searchMarker" />
          </template>
        </el-input>
      </div>
    </div>

    <MarkersTable :loading="markerLoading" class="content" />
  </div>
</template>

<style lang="scss" scoped>
.left-control-panel {
  --clip-rest: calc(100% - 31px - 1rem);
  --content-radius: 4px;

  grid-template-rows: auto 15rem auto 1fr;
  width: 432px;
  clip-path: inset(0 0);
  transform: translate(0, 0);
  transition: var(--el-transition-all);

  &.minus {
    --content-radius: 8px;
    clip-path: inset(8px var(--clip-rest) var(--clip-rest) 8px round 8px);
    transform: translate(-8px, -8px);
  }
}

.content {
  color: white;
  border: 1px solid rgb(134, 128, 120);
  height: 100%;
  border-radius: var(--content-radius);
  background-color: rgba(94, 94, 94, 0.3);
  transition: var(--el-transition-all);
  overflow: hidden;
}
</style>
