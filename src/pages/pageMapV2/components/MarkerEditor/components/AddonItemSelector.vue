<script lang="ts" setup>
import { useFormItem } from 'element-plus'
import { Delete, Setting } from '@element-plus/icons-vue'
import { AddonItemSelectorEP, AddonTeleporter } from '.'
import { useIconTagStore, useItemTypeStore } from '@/stores'
import db from '@/database'

const props = withDefaults(defineProps<{
  modelValue?: API.MarkerItemLinkVo[]
  addonId: string
  areaCode?: string
}>(), {
  modelValue: () => [],
})

const emits = defineEmits<{
  (e: 'update:modelValue', v: API.MarkerItemLinkVo[]): void
  (e: 'update:addonId', v: string): void
  (e: 'update:areaCode', v?: string): void
}>()

const itemTypeStore = useItemTypeStore()
const iconTagStore = useIconTagStore()

const { formItem } = useFormItem()

const isError = computed(() => formItem?.validateState === 'error')

const markerItemList = ref(props.modelValue)
watch(markerItemList, (v) => {
  emits('update:modelValue', v)
  nextTick(() => formItem?.validate('change').catch(() => false))
}, { deep: true })

watch(() => props.areaCode, () => {
  markerItemList.value = []
})

const rawItemList = asyncComputed(async () => {
  if (!props.areaCode)
    return []
  const area = await db.area.where('code').equals(props.areaCode).first()
  return area?.id === undefined ? [] : await db.item.where('areaId').equals(area.id).toArray()
}, [])

const activeItemMap = computed(() => Object.fromEntries(markerItemList.value.map(linkItem => [
  linkItem.itemId as number,
  rawItemList.value.find(item => item.id === linkItem.itemId) as API.ItemVo,
])))

const deleteItem = (id?: number) => {
  const findIndex = markerItemList.value.findIndex(item => item.itemId === id)
  if (findIndex < 0)
    return
  markerItemList.value.splice(findIndex, 1)
}

const isAddonActived = computed({
  get: () => props.addonId === 'itemList',
  set: v => emits('update:addonId', v ? 'itemList' : ''),
})
</script>

<template>
  <div class="w-full flex gap-1">
    <div
      v-bind="$attrs"
      class="marker-item-select w-full"
      :class="{ 'actived': isAddonActived, 'is-error': isError }"
    >
      <div
        v-for="item, index in markerItemList"
        :key="item.itemId"
        class="w-full rounded flex gap-1.5 items-center justify-between p-1"
      >
        <img
          :src="iconTagStore.iconTagMap[item.iconTag as string]?.url"
          class="w-7 aspect-square object-contain rounded-full bg-slate-500"
          referrerpolicy="no-referrer"
          crossorigin=""
        >
        <span style="color: var(--el-color-warning)">
          {{ itemTypeStore.itemTypeMap[`${activeItemMap[`${item.itemId}`]?.typeIdList?.[0]}`]?.name?.slice(-2) ?? 'unknown' }}
        </span>
        <span class="flex-1 text-ellipsis whitespace-nowrap overflow-hidden" :title="activeItemMap[`${item.itemId}`]?.name ?? 'unknown'">
          {{ activeItemMap[`${item.itemId}`]?.name ?? 'unknown' }}
        </span>
        <el-input-number
          v-model="markerItemList[index].count"
          controls-position="right"
          class="tiny-input-number"
          style="width: 64px"
          step-strictly
          :step="1"
          :min="1"
        />
        <el-button :icon="Delete" type="danger" plain style="padding: 8px;" @click="() => deleteItem(item.itemId)" />
      </div>
      <div
        v-if="!modelValue?.length"
        class="h-full grid place-items-center bg-gray-400 bg-opacity-0 hover:bg-opacity-10 active:bg-opacity-20 cursor-pointer transition-all"
        style="color: var(--el-color-primary)"
        @click="isAddonActived = true"
      >
        添加物品
      </div>
    </div>

    <el-button :icon="Setting" :type="isAddonActived ? 'primary' : ''" title="选择物品" circle @click="isAddonActived = !isAddonActived" />

    <AddonTeleporter :active="isAddonActived">
      <AddonItemSelectorEP v-model="markerItemList" :area-code="areaCode" :raw-item-list="rawItemList" />
    </AddonTeleporter>
  </div>
</template>

<style lang="scss" scoped>
.marker-item-select {
  border: 1px solid var(--el-border-color);
  height: 82px;
  border-radius: var(--el-border-radius-base);
  transition: border-color var(--el-transition-duration-fast) var(--el-transition-function-ease-in-out-bezier);
  overflow: auto;
  &:hover {
    border-color: var(--el-border-color-hover);
  }
  &.actived {
    border-color: var(--el-color-primary);
  }
  &.is-error {
    border-color: var(--el-color-danger);
  }
}

.tiny-input-number {
  :deep(.el-input-number__decrease) {
    width: 20px;
  }
  :deep(.el-input-number__increase) {
    width: 20px;
  }
  &.is-controls-right {
    :deep(.el-input__wrapper) {
      padding-left: 0;
      padding-right: 20px;
    }
  }
}
</style>
