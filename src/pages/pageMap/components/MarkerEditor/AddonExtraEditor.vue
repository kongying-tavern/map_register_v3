<script lang="ts" setup>
import { ExtraJSON } from '@/utils'
import type { MarkerExtra } from '@/utils'
import { getIslandOptions, getUndergroundConfigs } from '@/pages/pageMap/configs'
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
  const { region_name = '', region_levels = [] } = underground
  const { island_name = '', island_state = [] } = island
  // 多处理一下防止字段不存在，以便进行双绑
  return {
    caves,
    'underground': { region_name, region_levels },
    '2_8_island': { island_name, island_state },
  }
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

// ==================== 地下部分 ====================
/** 地下配置 */
const undergroundConfig = computed(() => {
  const { modelId = 'basic', options = [] } = getUndergroundConfigs()[mapStore.areaCode ?? ''] ?? {}
  return { modelId, options }
})

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

/** 是否为地下 */
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
    parseredExtra.value.underground.model_id = undergroundConfig.value.modelId
  },
})
</script>

<template>
  <div class="w-full flex gap-2">
    <template v-if="is28AppleIsland">
      <el-select-v2 v-model="isLandName" style="width:100px" :options="islandOptions" />
      <el-select-v2
        v-model="parseredExtra['2_8_island'].island_state"
        :disabled="!islandChildrenOptions.length"
        :options="islandChildrenOptions"
        class="flex-1"
        multiple
        collapse-tags
        collapse-tags-tooltip
      />
    </template>
    <template v-else>
      <el-switch v-model="isUnderground" inline-prompt active-text="地下" inactive-text="地上" />
      <el-cascader
        v-if="isUnderground && undergroundConfig.options.length"
        v-model="undergroundRegion"
        :options="undergroundConfig.options"
        class="flex-1"
      />
    </template>
  </div>
</template>
