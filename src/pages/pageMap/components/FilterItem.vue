<script lang="ts" setup>
import { RadioCardGroup, RadioCardItem } from '.'

const props = defineProps<{
  modelValue?: string
  itemList: API.ItemVo[]
  iconMap: Record<string, string>
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()

const internalBind = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})
</script>

<template>
  <RadioCardGroup v-model="internalBind" :item-list="itemList" data-key="name" item-key="itemId">
    <template #default="{ item, actived }">
      <RadioCardItem :src="iconMap[item.iconTag ?? '']" :title="item.name" :actived="actived" />
    </template>
  </RadioCardGroup>
</template>
