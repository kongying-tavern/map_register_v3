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

/** 一级地区的 areaId */
const parentId = ref<number>()
/** 二级地区的 areaCode */
const internalBind = computed({
  get: () => props.modelValue,
  set: (v) => {
    emits('update:modelValue', v)
    emits('change', v)
  },
})

/** 一级地区列表 */
const parentAreaList = computed(() => areaList.value.filter(area => !area.isFinal))
/** 一级地区映射表，value 为对应的二级地区 */
const parentAreaMap = computed(() => areaList.value.reduce((seed, area) => {
  if (area.isFinal && area.areaId !== undefined) {
    if (!(area.parentId as number in seed))
      seed[area.parentId as number] = [area]
    else
      seed[area.parentId as number].push(area)
  }
  return seed
}, {} as Record<number, API.AreaVo[]>))
/** 二级地区列表 */
const leafList = computed(() => parentId.value === undefined ? [] : (parentAreaMap.value?.[parentId.value] ?? []))

/** 如果 url 参数存在已选择的二级地区 code，则初始化对应的一级地区 */
watch(internalBind, () => {
  const childArea = areaList.value.find(area => area.code === internalBind.value)
  if (!childArea)
    return
  const parentArea = areaList.value.find(area => area.areaId === childArea?.parentId)
  parentId.value = parentArea?.areaId
})
</script>

<template>
  <div class="flex">
    <RadioCardGroup v-model="parentId" class="flex-1" :cols="1" :item-list="parentAreaList" data-key="areaId" item-key="areaId">
      <template #default="{ item, actived }">
        <RadioCardItem :src="iconMap?.[item.iconTag]" :title="item.name" :actived="actived" />
      </template>
    </RadioCardGroup>

    <div class="h-full p-1 bg-stone-500" style="clip-path: inset(16px 44%);" />

    <RadioCardGroup v-model="internalBind" class="flex-1" :cols="1" :item-list="leafList" data-key="code" item-key="code">
      <template #default="{ item, actived }">
        <RadioCardItem :title="item.name" :actived="actived" :icon="false" />
      </template>
    </RadioCardGroup>
  </div>
</template>
