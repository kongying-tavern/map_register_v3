<script lang="ts" setup>
import { SumeruPalace } from './MarkerEditExtra'
import { useMapStore } from '@/stores'
import type { MarkerExtra } from '@/utils'
import { ExtraJSON } from '@/utils'

/** 选项配置 */
interface OptionsVo {
  label: string
  value: string
  children?: {
    label: string
    value: string
  }[]
}

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()

// 选中地区获取
/** 地图信息 */
const mapStore = useMapStore()
/** 选中地区代码 */
const selectedAreaCode = mapStore.areaCode

/** extra数据 */
const extra = ref<MarkerExtra>(ExtraJSON.parse(props.modelValue ?? '{}'))
// 防止extra地下部分为空
if (!extra.value.underground)
  extra.value.underground = { is_underground: true, model_id: 'basic', region_name: '', region_levels: [] }

/** 所在地区判断 */
const isPluginsArea = (code: string) => {
  if (!selectedAreaCode)
    return false
  return code === selectedAreaCode
}
/** 大赤沙海配置 */
const palaceOptions = ref<OptionsVo[]>([
  { label: '地上', value: 'null' }, // 提交时将null转换
  { label: '地下', value: 'ug' },
  {
    label: '圣显',
    value: 'sx',
    children: [
      { label: '圣显 · 上', value: '1' },
      { label: '圣显 · 中', value: '2' },
      { label: '圣显 · 下', value: '3' },
    ],
  },
  {
    label: '舍身',
    value: 'ss',
    children: [
      { label: '舍身 · 上', value: '1' },
      { label: '舍身 · 中', value: '2' },
      { label: '舍身 · 下', value: '3' },
    ],
  },
  {
    label: '秘仪',
    value: 'my',
    children: [
      { label: '秘仪 · 上', value: '1' },
      { label: '秘仪 · 中', value: '2' },
      { label: '秘仪 · 下', value: '3' },
    ],
  },
  {
    label: '王陵',
    value: 'wl',
    children: [
      { label: '王陵 · 初', value: '0' },
      { label: '王陵 · 上', value: '1' },
      { label: '王陵 · 中', value: '2' },
      { label: '王陵 · 下', value: '3' },
    ],
  },
])
/** 千壑沙地配置数据 */
const desertOptions = [
  { label: '地上', value: 'null' }, // 提交时将null转换
  { label: '地下1', value: 'ug1' },
  { label: '地下2', value: 'ug2' },
  { label: '地下3', value: 'ug3' },
]
/** 通用地下判断 */
const isBasic = computed(() => {
  // 通用地下地区屏蔽数组
  const excludeList = ['A:XM:DESERT', 'A:XM:DESERT2']
  return !excludeList.includes(selectedAreaCode ?? '')
})

watch(extra, () => {
  emit('update:modelValue', ExtraJSON.stringify(extra.value))
}, { deep: true })
</script>

<template>
  <!-- 通用地下 -->
  <el-switch
    v-if="isBasic"
    v-model="extra.underground!.is_underground"
    active-text="地下"
    inactive-text="地上"
  />
  <!-- 须弥 大赤沙海 -->
  <SumeruPalace
    v-if="isPluginsArea('A:XM:DESERT')"
    v-model="extra"
    :options="palaceOptions"
  />
  <!-- 须弥 千壑沙地 -->
  <SumeruPalace
    v-if="isPluginsArea('A:XM:DESERT2')"
    v-model="extra"
    :options="desertOptions"
  />
</template>
