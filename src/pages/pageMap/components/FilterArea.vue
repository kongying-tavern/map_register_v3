<script lang="ts" setup>
import { areaListInjection, iconMapInjection } from '../shared'
import { RadioCardGroup, RadioCardItem } from '.'

const props = defineProps<{
  modelValue?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
  (e: 'change', v?: string): void
}>()

const areaList = inject(areaListInjection, ref([]))
const iconMap = inject(iconMapInjection, ref<Record<string, string>>({}))

/** 地区 id 与地区对象映射表 */
const areaIdMap = computed<Record<number, API.AreaVo>>(() => Object.fromEntries(areaList.value.map(area => [area.areaId, area])))

/** 一级地区列表 */
const parentAreaList = computed(() => areaList.value.filter(area => !area.isFinal))

/** 一级地区映射表，key 为一级地区 code，value 为对应的二级地区数组 */
const parentAreaMap = computed(() => areaList.value.reduce((seed, area) => {
  if (!area.isFinal || area.parentId === undefined || area.code === undefined)
    return seed
  const parentArea = areaIdMap.value[area.parentId]
  if (parentArea.code === undefined)
    return seed
  if (!(parentArea.code in seed))
    seed[parentArea.code] = [area]
  else
    seed[parentArea.code].push(area)
  return seed
}, {} as Record<string, API.AreaVo[]>))

/** 切换一级地区时暂时不触发 change 事件以便用户选择二级地区 */
const changeEventFlag = ref(true)

/** 二级地区的 areaCode */
const childAreaCode = computed({
  get: () => props.modelValue,
  set: (v) => {
    emits('update:modelValue', v)
    if (!changeEventFlag.value) {
      changeEventFlag.value = true
      return
    }
    emits('change', v)
  },
})

const childAreaTag = computed(() => childAreaCode.value?.split(':')?.[1])

/** 一级地区的 code */
const parentAreaCode = computed<string | undefined>({
  get: () => {
    if (props.modelValue === undefined)
      return undefined
    const childAreaTag = props.modelValue.split(':')[1]
    // 根据地区代码规范，一级地区形如 C:LY，二级地区形如 A:LY:LIYUE，其中第二部分为相同的
    return `C:${childAreaTag}`
  },
  set: (v) => {
    if (v === undefined) {
      childAreaCode.value = undefined
      return
    }
    const parentAreaTag = v.split(':')[1]
    if (childAreaTag.value === undefined || childAreaTag.value !== parentAreaTag) {
      changeEventFlag.value = false
      childAreaCode.value = parentAreaMap.value[v]?.[0].code
    }
  },
})

/** 二级地区列表 */
const childAreaList = computed(() => parentAreaCode.value === undefined
  ? []
  : (parentAreaMap.value?.[parentAreaCode.value] ?? []),
)
</script>

<template>
  <div class="flex">
    <RadioCardGroup v-model="parentAreaCode" class="flex-1" :cols="1" :item-list="parentAreaList" data-key="code" item-key="code">
      <template #default="{ item, actived }">
        <RadioCardItem :src="iconMap?.[item.iconTag]" :title="item.name" :actived="actived" />
      </template>
    </RadioCardGroup>

    <div class="h-full p-1 bg-stone-500" style="clip-path: inset(16px 44%);" />

    <RadioCardGroup v-model="childAreaCode" class="flex-1" :cols="1" :item-list="childAreaList" data-key="code" item-key="code">
      <template #default="{ item, actived }">
        <RadioCardItem :title="item.name" :actived="actived" :icon="false" />
      </template>
    </RadioCardGroup>
  </div>
</template>
