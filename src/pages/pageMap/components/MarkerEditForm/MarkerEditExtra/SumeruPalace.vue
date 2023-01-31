<script lang="ts" setup>
import { isArray } from 'lodash'
import type { MarkerExtra } from '@/utils'
import { useMapStore } from '@/stores'

interface OptionsVo {
  label: string
  value: string
  children?: {
    label: string
    value: string
  }[]
}

const props = defineProps<{
  modelValue: MarkerExtra
  options: OptionsVo[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v?: MarkerExtra): void
}>()

/** 地图信息 */
const mapStore = useMapStore()
/** 选中地区代码 */
const selectedAreaCode = mapStore.areaCode

const data = ref<MarkerExtra>(props.modelValue)
const options = ref<OptionsVo[]>(props.options)
const childrenOptions = ref<{ label: string; value: string }[]>([])
const children = ref<boolean>(false)
/** modelId映射 */
const modelId: Record<string, string> = {
  'A:XM:DESERT': 'sumeru2',
  'A:XM:DESERT2': 'sumeru3',
}
data.value.underground!.model_id = modelId[selectedAreaCode ?? '']
// 兼容性代码
if (data.value.underground!.is_underground)
  data.value.underground!.region_name = 'ug'
else
  data.value.underground!.region_name = 'null'

/** 区域代号更改事件 */
const palaceChange = (val: string) => {
  // 区域层级获取
  const childrenO = options.value.find(e => e.value === val)?.children
  data.value.underground!.region_levels = []
  childrenOptions.value = isArray(childrenO) ? childrenO : []
  children.value = isArray(childrenO)
  // 是否为地下
  data.value.underground!.is_underground = val !== 'null'
}

watch(data, () => emit('update:modelValue', data.value))
</script>

<template>
  <el-select
    v-model="data.underground!.region_name"
    placeholder="选择"
    @change="palaceChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
  <el-select
    v-if="children"
    v-model="data.underground!.region_levels"
    placeholder="选择"
    multiple
  >
    <el-option
      v-for="item in childrenOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
