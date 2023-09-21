<script lang="ts" setup>
import { AppItemSelecter } from '@/components'

const props = defineProps<{
  modelValue: API.MarkerItemLinkVo[]
  rawItemList: API.ItemVo[]
  areaCode?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: API.MarkerItemLinkVo[]): void
  (e: 'update:areaCode', v?: string): void
}>()

const itemMap = computed(() => props.rawItemList.reduce((seed, item) => {
  seed[item.id!] = item
  return seed
}, {} as Record<string, API.ItemVo>))

const bindItemList = computed({
  get: () => props.modelValue.reduce((seed, linkItem) => {
    const item = itemMap.value[linkItem.itemId!]
    item && seed.push(item)
    return seed
  }, [] as API.ItemVo[]),
  set: (items) => {
    const linkItems = items.reduce((seed, item) => {
      const findIndex = props.modelValue.findIndex(linkItem => linkItem.itemId === item.id)
      seed.push({
        iconTag: item.iconTag,
        itemId: item.id,
        count: findIndex < 0 ? 1 : props.modelValue[findIndex].count,
      })
      return seed
    }, [] as API.MarkerItemLinkVo[])
    emits('update:modelValue', linkItems)
  },
})
</script>

<template>
  <AppItemSelecter
    v-model="bindItemList"
    :area-code="areaCode"
    :show-total="false"
    :show-area-selector="false"
    height="100%"
  />
</template>
