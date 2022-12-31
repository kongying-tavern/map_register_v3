<script lang="ts" setup>
import { areaListInjection, iconMapInjection } from '../shared'
import { RadioCardGroup, RadioCardItem } from '.'

const props = defineProps<{
  modelValue?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: number): void
  (e: 'change', v?: number): void
}>()

const internalBind = computed({
  get: () => `${props.modelValue}`,
  set: (v) => {
    emits('update:modelValue', `${v}` || undefined)
    emits('change', v || undefined)
  },
})

const areaList = inject(areaListInjection, ref([]))
const iconMap = inject(iconMapInjection, ref<Record<string, string>>({}))

const leafList = computed(() => areaList.value.reduce((seed, { code, parentId, ...rest }) => {
  parentId !== -1 && seed.push({
    ...rest,
    areaCode: `${code}`,
  })
  return seed
}, [] as Record<string, any>[]))
</script>

<template>
  <RadioCardGroup v-model="internalBind" :item-list="leafList" data-key="areaCode" item-key="areaCode">
    <template #default="{ item, actived }">
      <RadioCardItem :src="iconMap?.[item.iconTag]" :title="item.name" :actived="actived" />
    </template>
  </RadioCardGroup>
</template>
