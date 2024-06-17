<script lang="ts" setup>
import { keyBy } from 'lodash'
import { computed, ref } from 'vue'
import { SelectList } from '../../../SelectList'
import type { AreaWithExtraConfig } from '@/stores'

const props = defineProps<{
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
</script>

<template>
  <div class="w-full flex-1 flex gap-2 overflow-hidden">
    <el-scrollbar class="flex-1">
      <SelectList
        v-model="selectedAreaId"
        class="h-full overflow-auto gap-1"
        :list="list"
        value-key="id"
      >
        <template #default="{ item }">
          <div class="flex-auto flex">
            <span class="flex-auto">{{ item.name }}</span>
          </div>
        </template>
      </SelectList>
    </el-scrollbar>
    <div class="w-[2px] h-[97%] translate-y-[1.5%] bg-[#E3DDD140]" />
    <el-scrollbar class="flex-1">
      <template
        v-for="(layerGroup, layerGroupIndex) in selectedLayers"
        :key="layerGroupIndex"
      >
        <div v-if="layerGroup.children && layerGroup.children.length > 0">
          <div class="flex pt-2 pb-1">
            <span class="flex-auto text-base leading-loose">
              {{ layerGroup.label }}
            </span>
          </div>
          <SelectList
            v-model="modelValue"
            :multiple="true"
            class="h-full overflow-auto gap-1"
            :list="layerGroup.children"
            :value-key="valueKey"
          >
            <template #default="{ item }">
              <div class="flex-auto flex">
                <span class="flex-auto">{{ item[labelKey] }}</span>
              </div>
            </template>
          </SelectList>
        </div>
      </template>
    </el-scrollbar>
  </div>
</template>
