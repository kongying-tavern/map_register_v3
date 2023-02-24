<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import type { Directive } from 'vue'
import { KeepAlive } from 'vue'
import { ElMessage } from 'element-plus'
import type L from 'leaflet'
import { FilterArea, FilterItem, FilterStep, FilterType, MarkersTable } from '@/pages/pageMap/components'
import { localSettings, useMapStore } from '@/stores'
import Api from '@/api/api'
import { createLinkMarker, useMap, useMarker } from '@/pages/pageMap/hooks'
import { sleep } from '@/utils'
import { usePagination } from '@/hooks'

const mapStore = useMapStore()
const { map } = useMap()
const { markerList, loading, createMarkerWhenReady } = useMarker()

/** tab 的可用标签，仅控制视图，无业务逻辑 */
const steps = ['地区', '分类', '物品']

/** tab 过渡动画的名称，可用过渡在 src/style/transition */
const transitionAnimationName = ref('slide-x-r')
watch(() => mapStore.step, (newStep = 0, oldStep = 0) => {
  transitionAnimationName.value = newStep > oldStep ? 'slide-x-r' : 'slide-x-l'
})

const next = (v?: string | number) => {
  if (v === undefined || !localSettings.value.autoTurnNext)
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

const { pagination, pages, disabledNext, disabledPre, nextPage, prePage } = usePagination({
  init: {
    current: 1,
    total: 0,
    pageSize: 20,
  },
})
</script>

<template>
  <div class="left-control-panel grid p-2 gap-1" :class="{ minus }" v-bind="$attrs">
    <!-- 顶部筛选器 -->
    <div class="step-selector grid gap-1">
      <FilterStep v-model="mapStore.step" :step-names="steps" class="rounded-md overflow-hidden" />

      <KeepAlive>
        <FilterArea v-if="(mapStore.step === 0)" v-model="mapStore.areaCode" @change="next" />

        <div v-else-if="mapStore.areaCode === undefined" class="grid place-items-center text-white">
          <el-button link type="primary" @click="(mapStore.step = 0)">
            请选择地区
          </el-button>
        </div>

        <FilterType v-else-if="(mapStore.step === 1)" v-model="mapStore.typeId" @change="next" />

        <div v-else-if="!mapStore.typeId" class="grid place-items-center text-white">
          <el-button link type="primary" @click="(mapStore.step = 1)">
            请选择分类
          </el-button>
        </div>

        <FilterItem v-else-if="(mapStore.step === 2)" v-model="mapStore.iconName" />
      </KeepAlive>
    </div>

    <!-- 顶部右侧按钮 -->
    <div class="w-8 flex flex-col gap-1 text-gray-300">
      <div v-for="i in 5" :key="i" class="right-button aspect-square rounded-md flex items-center justify-center">
        {{ i }}
      </div>
    </div>

    <!-- 底部表格 -->
    <MarkersTable v-model:pagination="pagination" class="content col-span-2" />

    <!-- 右侧悬浮面板 -->
    <div class="absolute bottom-0 left-full px-2 flex flex-col gap-1">
      <el-tooltip
        v-model:visible="tooltipVisible"
        :content="tooltipContent"
        :virtual-ref="tooltipTarget"
        trigger="hover"
        placement="top"
        virtual-triggering
      />

      <el-input
        v-model="formatInput"
        placeholder="点位ID"
        class="h-full"
        style="--el-input-border-radius: 6px"
        @clear="searchMarker"
        @keydown.enter="searchMarker"
      >
        <template #append>
          <el-button v-tooltip="'跳转到指定ID点位'" :icon="Search" @click="searchMarker" />
        </template>
      </el-input>

      <div class="pagination select-none genshin-text">
        <div class="page-unit col-span-4">
          共 {{ pagination.total }} 项
        </div>
        <el-button text type="primary" class="page-unit aspect-square" style="padding: 0" :disabled="loading || disabledPre" @click="prePage">
          ←
        </el-button>
        <div class="page-unit col-span-2">
          {{ pagination.current }} / {{ pages }}
        </div>
        <el-button text type="primary" class="page-unit aspect-square" style="padding: 0" :disabled="loading || disabledNext" @click="nextPage">
          →
        </el-button>
      </div>

      <el-checkbox-button v-model="mapStore.showAuditedMarker" class="checkbox-button">
        已审点位并入列表
      </el-checkbox-button>

      <el-checkbox-button v-model="mapStore.showPunctuateMarker" class="checkbox-button">
        未审点位并入列表
      </el-checkbox-button>

      <el-checkbox-button v-model="mapStore.onlyUnderground" class="checkbox-button">
        仅显示地下点位
      </el-checkbox-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.left-control-panel {
  --content-background: rgb(48 49 51 / 0.3);

  grid-template-rows: 18rem 1fr;
  grid-template-columns: 1fr auto;
  width: 432px;
  transition: var(--el-transition-all);
}

.step-selector {
  grid-template-rows: 30px 1fr;
}

.right-button {
  width: 30px;
  background: var(--content-background);
}

.checkbox-button {
  :deep(.el-checkbox-button__inner) {
    width: 100%;
    border-radius: 6px;
    box-shadow: none;
  }
}

.content {
  color: white;
  transition: var(--el-transition-all);
  overflow: hidden;
}

// TODO 封装
.pagination {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  border-radius: 6px;
  background: rgb(255 255 255 / 0.3);
  backdrop-filter: blur(56px);

  .page-unit {
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
