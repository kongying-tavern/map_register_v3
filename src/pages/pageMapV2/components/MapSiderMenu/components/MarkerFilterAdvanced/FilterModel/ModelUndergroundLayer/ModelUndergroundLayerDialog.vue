<script lang="ts" setup>
import { keyBy } from 'lodash'
import { SelectList } from '../../../SelectList'
import type { AreaWithExtraConfig } from '@/stores'
import type { MAFMetaUndergroundLayer } from '@/stores/types'
import { useListBubbleDrag } from '@/hooks'

const props = defineProps<{
  meta: MAFMetaUndergroundLayer
  listClass?: string
  list: AreaWithExtraConfig[]
  labelKey: string
  valueKey: string
}>()

const modelValue = defineModel<string[]>('modelValue', {
  required: true,
  default: [],
})

interface ConfigLayerUnit {
  label: string
  value: string
  children: {
    label: string
    value: string
  }[]
}

const areaCombinedMap = computed(() => keyBy(props.list, 'id'))

const selectedAreaId = ref<number>(0)

const selectedLayers = computed<ConfigLayerUnit[]>(() => {
  const selectedArea = areaCombinedMap.value[selectedAreaId.value] ?? {}
  const { extraConfig = {} } = selectedArea
  const { underground = {} } = extraConfig
  const { levels = [] } = underground
  return levels
})

/* --------------------------------------------------
 * 计数相关数据
 * --------------------------------------------------
 */
const layerCountMap = computed(() => {
  const countMap: Record<string | number, number> = {}
  modelValue.value.forEach((layerKey) => {
    const layerKeyItem = props.meta.layerKeyMap[layerKey]
    if (!layerKeyItem)
      return
    layerKeyItem.forEach((keyItem) => {
      const { areaId = 0, groupKey = '' } = keyItem
      if (!areaId || !groupKey)
        return
      countMap[areaId] = (countMap[areaId] ?? 0) + 1
      countMap[`${areaId}-${groupKey}`] = (countMap[`${areaId}-${groupKey}`] ?? 0) + 1
    })
  })
  return countMap
})

/* --------------------------------------------------
 * 拖拽计数清除分组逻辑
 * --------------------------------------------------
 */
// 地区计数拖动
const removeArea = (area: AreaWithExtraConfig) => {
  const shallowCopyValue = [...modelValue.value]
  const valueSet = new Set<string>(shallowCopyValue);
  (area.extraConfig?.underground?.levels ?? []).forEach((group) => {
    group.children.forEach(layer => valueSet.delete(layer.value!))
  })
  modelValue.value = Array.from(valueSet)
}

const {
  onDragStart: onAreaDragStart,
  onDragEnd: onAreaDragEnd,
  onDrop: onAreaDrop,
} = useListBubbleDrag<AreaWithExtraConfig>({
  isDropback: (ev, item) => Boolean(ev.composedPath().find(target => (target instanceof HTMLElement) && Number(target.dataset.dragAreaId) === item.id!)),
  onClearBubble: removeArea,
})

// 分组计数拖动
const removeGroup = (item: ConfigLayerUnit) => {
  const shallowCopyValue = [...modelValue.value]
  const valueSet = new Set<string>(shallowCopyValue);
  (item.children ?? []).forEach((layer) => {
    valueSet.delete(layer.value)
  })
  modelValue.value = Array.from(valueSet)
}

const {
  isDragging: isGroupDragging,
  onDragStart: onGroupDragStart,
  onDragEnd: onGroupDragEnd,
  onDrop: onGroupDrop,
} = useListBubbleDrag<ConfigLayerUnit>({
  isDropback: (ev, item) => Boolean(ev.composedPath().find(target => (target instanceof HTMLElement) && target.dataset.dragGroupId === item.value)),
  onClearBubble: removeGroup,
})
</script>

<template>
  <div class="w-full flex-1 flex gap-2 overflow-hidden">
    <el-scrollbar class="flex-1">
      <SelectList
        v-model="selectedAreaId"
        class="h-full overflow-auto gap-1"
        :disabled="isGroupDragging"
        :list="list"
        value-key="id"
        @dragover.prevent
        @dragend="onAreaDragEnd"
        @drop="onAreaDrop"
      >
        <template #default="{ item }">
          <div
            class="flex-auto flex items-center"
            :data-drag-area-id="item.id"
          >
            <span class="flex-auto">{{ item.name }}</span>
            <el-button
              v-if="layerCountMap[item.id!]"
              class="flex-none"
              type="primary"
              size="small"
              round
              .draggable="true"
              @dragstart.stop="(ev) => onAreaDragStart(ev, item)"
            >
              {{ layerCountMap[item.id!] }}
            </el-button>
          </div>
        </template>
      </SelectList>
    </el-scrollbar>
    <div class="w-[2px] h-[97%] translate-y-[1.5%] bg-[#E3DDD140]" />
    <el-scrollbar
      class="flex-1"
      @dragover.prevent
      @dragend="onGroupDragEnd"
      @drop="onGroupDrop"
    >
      <template
        v-for="(layerGroup, layerGroupIndex) in selectedLayers"
        :key="layerGroupIndex"
      >
        <div
          v-if="layerGroup.children && layerGroup.children.length > 0"
          :data-drag-group-id="layerGroup.value"
        >
          <div class="flex pt-2 pb-1 gap-2 items-end">
            <span class="flex-none text-base leading-loose">
              {{ layerGroup.label }}
            </span>
            <div class="flex-auto">
              <el-button
                v-if="layerCountMap[`${selectedAreaId}-${layerGroup.value}`]"
                class="mb-[8px]"
                type="primary"
                size="small"
                round
                .draggable="true"
                @dragstart="(ev) => onGroupDragStart(ev, layerGroup)"
              >
                {{ layerCountMap[`${selectedAreaId}-${layerGroup.value}`] }}
              </el-button>
            </div>
          </div>
          <SelectList
            v-model="modelValue"
            :multiple="true"
            class="h-full overflow-auto gap-1"
            :list="layerGroup.children"
            :value-key="valueKey"
          >
            <template #default="{ item }">
              {{ item[labelKey] }}
            </template>
          </SelectList>
        </div>
      </template>
    </el-scrollbar>
  </div>
</template>
