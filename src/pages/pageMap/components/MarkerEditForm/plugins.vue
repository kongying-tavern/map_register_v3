<script lang="ts" setup>
import { sumeruDesert, sumeruPalace } from './plugins'
import { useMapStore } from '@/stores'

interface optionsVo {
  label: string
  value: string
  children?: {
    label: string
    value: string
  }[]
}

/** extra附加数据接口 */
interface extraVo {
  inazuma_underground?: boolean
  sumeru_underground?: boolean
  sumeru_palace?: {
    palace_name: string | null
    palace_level?: string[]
  }
  sumeru_desert2?: {
    ug_name: string
    ug_level?: string[]
  }
}

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()

/** 选中地区获取 */
const mapStore = useMapStore()
const selectedAreaCode = mapStore.areaCode

/** extra实例化 */
const extra = ref<extraVo>(JSON.parse(props.modelValue ?? '{}'))

/** 地区判断 */
const isPluginsArea = (code: string) => {
  if (!selectedAreaCode)
    return false
  if (code === 'C:DQ')
    return selectedAreaCode.search('A:DQ') > -1

  return code === selectedAreaCode
}
// 大赤沙海配置
const palaceOptions = ref<optionsVo[]>([
  { label: '无', value: 'null' }, // 提交时将null转换
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
// 千壑沙地
const desertOptions = [
  { label: '无', value: 'null' }, // 提交时将null转换
  { label: '?', value: '?' },
]
const sumeru_palace = computed(() => {
  return isPluginsArea('A:XM:DESERT')
})
const sumeru_desert2 = computed(() => {
  return isPluginsArea('A:XM:DESERT2')
})
// 诸法丛林
const sumeru_underground = computed(() => {
  if (!extra.value.sumeru_underground && isPluginsArea('A:XM:FOREST'))
    extra.value.sumeru_underground = false
  return isPluginsArea('A:XM:FOREST')
})
// 稻妻
const inazuma_underground = computed(() => {
  if (!extra.value.inazuma_underground && isPluginsArea('C:DQ'))
    extra.value.inazuma_underground = false
  return isPluginsArea('C:DQ')
})

watch(extra, () => {
  emit('update:modelValue', JSON.stringify(extra.value))
}, { deep: true })
</script>

<template>
  <!-- 须弥 诸法丛林 -->
  <el-switch
    v-if="sumeru_underground"
    v-model="extra.sumeru_underground"
    active-text="地下"
    inactive-text="地上"
  />
  <!-- 稻妻 -->
  <el-switch
    v-if="inazuma_underground"
    v-model="extra.inazuma_underground"
    active-text="地下"
    inactive-text="地上"
  />
  <!-- 须弥 大赤沙海 -->
  <sumeruPalace
    v-if="sumeru_palace"
    v-model="extra.sumeru_palace"
    :options="palaceOptions"
  />
  <!-- 须弥 千壑沙地 -->
  <sumeruDesert
    v-if="sumeru_desert2"
    v-model="extra.sumeru_desert2"
    :options="desertOptions"
  />
</template>
