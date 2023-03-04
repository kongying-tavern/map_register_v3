<script lang="ts" setup>
import { ExtraJSON } from '@/utils'
import type { MarkerExtra } from '@/utils'
import type { ExtraOption } from '@/pages/pageMap/configs'
import { getDesert2Options, getDesertOptions, getIslandOptions } from '@/pages/pageMap/configs'
import { useMapStore } from '@/stores'

const props = withDefaults(defineProps<{
  modelValue?: string
}>(), {
  modelValue: '',
})

const emits = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const mapStore = useMapStore()

/** 判断是否为空字段，是则去除以缩减序列化后的体积 */
const withoutEmpty = <T = unknown>(v: T): T | undefined => {
  if (typeof v !== 'object')
    return v
  const isEmpty = Array.isArray(v)
    ? v.length === 0
    : Object.keys(v as object).length === 0
  return isEmpty ? undefined : v
}

/** 预解析数据 */
const parseredExtra = ref<Required<MarkerExtra>>((() => {
  const { underground = {}, caves = [], '2_8_island': island = {} } = ExtraJSON.parse(props.modelValue)
  return { underground, caves, '2_8_island': island }
})())

/** 深度监听更新 */
watch(parseredExtra, (extra) => {
  emits('update:modelValue', ExtraJSON.stringify({
    '2_8_island': withoutEmpty(extra['2_8_island']),
    'underground': withoutEmpty(extra.underground),
    'caves': withoutEmpty(extra.caves),
  }))
}, { deep: true })

// ==================== 海岛独有部分 ====================
/** 是否为 2.8 海岛 */
const is28AppleIsland = computed(() => mapStore.areaCode === 'A:APPLE:2_8')

/** 岛屿名称 */
const isLandName = computed({
  get: () => parseredExtra.value['2_8_island'].island_name,
  set: (v) => {
    parseredExtra.value['2_8_island'].island_name = v
    parseredExtra.value['2_8_island'].island_state = []
  },
})
/** 海岛选项 */
const islandOptions = computed(() => getIslandOptions().map(({ label, value }) => ({ label, value })))
/** 海岛子区域选项 */
const islandChildrenOptions = computed(() => {
  return (getIslandOptions().find(opt => opt.value === isLandName.value)?.children ?? []) as { label: string; value: string }[]
})

// ==================== 须弥独有部分 ====================
/** 须弥选项（含子级） */
const sumeruOptions = computed(() => ({
  'A:APPLE:2_8': getIslandOptions,
  'A:XM:DESERT': getDesertOptions,
  'A:XM:DESERT2': getDesert2Options,
} as Record<string, () => ExtraOption[]>)[mapStore.areaCode ?? '']?.() ?? [])
/** 区域 id */
const modelId = computed(() => ({
  'A:XM:DESERT': 'sumeru2',
  'A:XM:DESERT2': 'sumeru3',
} as Record<string, string>)[mapStore.areaCode ?? ''] ?? 'basic')

/** 地下区域 */
const undergroundRegion = computed({
  get: () => {
    const { region_name = '', region_levels: [region_level] = [] as string[] } = parseredExtra.value.underground
    return [region_name, region_level].filter(Boolean)
  },
  set: (v) => {
    const [region_name, region_level] = v
    parseredExtra.value.underground.region_name = region_name
    parseredExtra.value.underground.region_levels = region_level ? [region_level] : undefined
  },
})

// ==================== 地下公共部分 ====================
const isUnderground = computed({
  get: () => parseredExtra.value.underground.is_underground,
  set: (v) => {
    if (!v) {
      delete parseredExtra.value.underground.is_underground
      delete parseredExtra.value.underground.model_id
      delete parseredExtra.value.underground.region_name
      delete parseredExtra.value.underground.region_levels
      return
    }
    parseredExtra.value.underground.is_underground = true
    parseredExtra.value.underground.model_id = modelId.value
  },
})
</script>

<template>
  <div class="w-full flex gap-1">
    <template v-if="is28AppleIsland">
      <el-select-v2 v-model="isLandName" style="width:100px" :options="islandOptions" />
      <el-select-v2 v-model="parseredExtra['2_8_island'].island_state" class="flex-1" :disabled="!islandChildrenOptions.length" :options="islandChildrenOptions" multiple collapse-tags collapse-tags-tooltip />
    </template>
    <template v-else>
      <el-switch v-model="isUnderground" inline-prompt active-text="地下" inactive-text="地上" />
      <el-cascader v-if="isUnderground && sumeruOptions.length" v-model="undergroundRegion" :options="sumeruOptions" />
    </template>
  </div>
</template>
