<script lang="ts" setup>
import { RadioCardGroup, RadioCardItem } from '.'
import { useTypeList } from '@/hooks'

const props = defineProps<{
  modelValue?: number
  iconMap: Record<string, string>
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: number): void
  (e: 'change', v?: number): void
}>()

const internalBind = computed({
  get: () => `${props.modelValue}`,
  set: (v) => {
    const formatValue = Number(v)
    emits('update:modelValue', formatValue || undefined)
    emits('change', formatValue || undefined)
  },
})

const { typeList } = useTypeList()

const leafList = computed(() => typeList.value.reduce((seed, { typeId, isFinal, ...rest }) => {
  isFinal && seed.push({
    ...rest,
    isFinal,
    typeId: `${typeId}`,
  })
  return seed
}, [] as Record<string, any>[]))
</script>

<template>
  <RadioCardGroup v-model="internalBind" :item-list="leafList" data-key="typeId" item-key="typeId">
    <template #default="{ item, actived }">
      <RadioCardItem :src="iconMap[item.iconTag ?? '']" :title="item.name" :actived="actived" />
    </template>
  </RadioCardGroup>
</template>
