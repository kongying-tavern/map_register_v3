<script lang="ts" setup>
import { iconMapInjection, itemListInjection } from '@/pages/pageMap/shared'
import { RadioCardGroup, RadioCardItem } from '@/pages/pageMap/components'

const props = defineProps<{
  modelValue?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()

const internalBind = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})

const itemList = inject(itemListInjection, ref([]))
const iconMap = inject(iconMapInjection, ref<Record<string, string>>({}))
</script>

<template>
  <RadioCardGroup v-bind="$attrs" v-model="internalBind" :item-list="itemList" data-key="name" item-key="itemId">
    <template #default="{ item, actived }">
      <RadioCardItem :src="iconMap[item.iconTag ?? '']" :title="item.name" :actived="actived" />
    </template>
  </RadioCardGroup>
</template>
