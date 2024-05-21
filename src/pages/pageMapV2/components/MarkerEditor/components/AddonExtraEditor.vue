<script lang="ts" setup>
import { defaultsDeep, pick } from 'lodash'
import type { CascaderOption } from 'element-plus'

const props = defineProps<{
  modelValue?: API.MarkerExtra
  areaCode?: string
  extraConfig: API.ExtraConfig
}>()

const emits = defineEmits<{
  'update:modelValue': [v: API.MarkerExtra]
}>()

type RequiredExtraForm = DeepRequired<API.MarkerExtra>

const requiredKeys = computed(() => Object.keys(props.extraConfig))

const DEFAULT_EXTRA_FORM: RequiredExtraForm = {
  '1_6_island': [],

  '2_8_island': {
    island_name: '',
    island_state: [],
  },

  'caves': [],

  'underground': {
    is_underground: false,
    region_levels: [],
  },
}

const getInitializedExtraForm = (data: API.MarkerExtra = {}) => defaultsDeep({}, data, DEFAULT_EXTRA_FORM)

const extraForm = ref<RequiredExtraForm>(getInitializedExtraForm(props.modelValue))

// ==================== 海岛 2.8 字段特殊处理 ====================
const island28BindValues = computed({
  get: () => {
    const { island_name, island_state = [] } = extraForm.value['2_8_island']
    if (!island_name || !island_state.length)
      return []
    const parentIsland = props.extraConfig['2_8_island']?.stages.find(island => island.value === extraForm.value['2_8_island'].island_name)
    if (!parentIsland)
      return []
    return island_state.map(islandValue => [parentIsland.value, islandValue])
  },
  set: (islandList) => {
    const parentIslandValue = islandList[0]?.[0]
    extraForm.value['2_8_island'] = {
      island_name: parentIslandValue ?? '',
      island_state: islandList.filter(([parentValue]) => parentValue === parentIslandValue).map(([_, islandValue]) => islandValue),
    }
  },
})

/** 子级不能跨父级多选，检测是否存在已选的父级 */
const island28Options = computed(() => {
  const { island_name } = extraForm.value['2_8_island']
  return props.extraConfig['2_8_island']?.stages.filter(option => Boolean(option.value)).map((option) => {
    const disabled = option.children && (island_name && option.value !== island_name)
    return { ...option, disabled }
  }) as CascaderOption[]
})

// ==================== 地下字段特殊处理 ====================

const isUnderground = computed({
  get: () => Boolean(props.modelValue?.underground?.is_underground),
  set: (bool) => {
    if (!bool) {
      extraForm.value.underground = null
      return true
    }
    extraForm.value.underground = {
      is_underground: true,
      region_levels: [],
    }
  },
})

/** 由于原始数据只存储末级层级的值，这里需要查找父级层级以便显示 */
const regionLevels = computed({
  get: () => {
    if (!props.modelValue?.underground?.region_levels?.length)
      return [] as string[][]

    const { levels = [] } = props.extraConfig.underground ?? {}
    if (!levels.length)
      return [] as string[][]

    const regionCodeMap = levels.reduce((map, parent) => {
      parent.children.forEach(({ value }) => {
        map.set(value, parent)
      })
      return map
    }, new Map<string, (typeof levels)[number]>())

    return props.modelValue.underground.region_levels.reduce((seed, regionCode) => {
      const parent = regionCodeMap.get(regionCode)
      if (parent)
        seed.push([parent.value, regionCode])
      return seed
    }, [] as string[][])
  },
  set: (levelList) => {
    if (!extraForm.value.underground)
      return false
    extraForm.value.underground.region_levels = levelList.reduce((seed, [_, regionCode]) => {
      regionCode !== undefined && seed.push(regionCode)
      return seed
    }, [] as string[])
  },
})

// ==================== 数据下行 ====================
const isInternalUpdate = ref(false)
watch(() => props.modelValue, (externalValue) => {
  if (isInternalUpdate.value) {
    isInternalUpdate.value = false
    return
  }
  extraForm.value = getInitializedExtraForm(externalValue)
}, { deep: true })

// ==================== 数据上行 ====================
watch(() => extraForm.value, (internalValue) => {
  isInternalUpdate.value = true
  emits('update:modelValue', pick(internalValue, requiredKeys.value))
}, { deep: true })

// ==================== extra 配置变更时重置表单数据 ====================
watch(() => props.extraConfig, () => {
  isInternalUpdate.value = true
  extraForm.value = getInitializedExtraForm()
}, { deep: true })
</script>

<template>
  <div class="w-full h-9 flex flex-col gap-2 overflow-hidden">
    <div v-if="extraConfig['1_6_island']" class="flex gap-2">
      <el-cascader
        v-model="extraForm['1_6_island']"
        :options="extraConfig['1_6_island'].stages"
        clearable
        class="flex-1"
      />
    </div>

    <div v-else-if="extraConfig['2_8_island']" class="flex gap-2">
      <el-cascader
        v-model="island28BindValues"
        :options="island28Options"
        :props="{
          multiple: true,
          disabled: 'disabled',
        }"
        collapse-tags
        collapse-tags-tooltip
        clearable
        class="flex-1"
      />
    </div>

    <div v-else-if="extraConfig.underground" class="flex gap-2 overflow-hidden">
      <el-switch
        v-model="isUnderground"
        :active-text="extraConfig.underground.textActive ?? '地下'"
        :inactive-text="extraConfig.underground.textInactive ?? '地上'"
        inline-prompt
        class="flex-shrink-0"
      />
      <el-cascader
        v-if="extraConfig.underground.useDetail && extraForm.underground?.is_underground"
        v-model="regionLevels"
        :options="extraConfig.underground.levels"
        :props="{
          multiple: true,
        }"
        :show-all-levels="false"
        collapse-tags
        collapse-tags-tooltip
        class="flex-1"
      />
    </div>
  </div>
</template>
