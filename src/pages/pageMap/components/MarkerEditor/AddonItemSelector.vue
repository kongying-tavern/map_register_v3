<script lang="ts" setup>
import { Close, Setting } from '@element-plus/icons-vue'
import { AddonItemSelectorEP, TeleportExtra } from '.'
import { useIconList, useItemList, useTypeList } from '@/hooks'

const props = defineProps<{
  modelValue?: API.MarkerItemLinkVo[]
  extraId: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: API.MarkerItemLinkVo[]): void
  (e: 'update:extraId', v: string): void
}>()

const { typeMap } = useTypeList()
const { getItem } = useItemList()
const { iconMap } = useIconList()

const internalBind = ref(props.modelValue ?? [])
watch(internalBind, v => emits('update:modelValue', v), { deep: true })

const extraActive = computed(() => props.extraId === 'itemList')
const toggleExtraPanel = () => {
  emits('update:extraId', extraActive.value ? '' : 'itemList')
}
</script>

<template>
  <div class="w-full flex gap-1">
    <div
      v-bind="$attrs"
      class="marker-item-select w-full"
      :class="{
        extraActive,
      }"
    >
      <div
        v-for="item, index in internalBind"
        :key="item.itemId"
        class="w-full rounded flex gap-1 items-center justify-between p-1"
      >
        <img
          :src="iconMap[item.iconTag as string]"
          class="w-7 aspect-square object-contain rounded-full bg-slate-500"
          referrerpolicy="no-referrer"
          crossorigin=""
        >
        <div class="flex-1 text-ellipsis whitespace-nowrap overflow-hidden" :title="getItem(item.itemId)?.name">
          {{ typeMap[getItem(item.itemId)?.typeIdList?.[0] ?? -1]?.name ?? '未分类' }} - {{ getItem(item.itemId)?.name }}
        </div>
        <el-icon><Close /></el-icon>
        <el-input-number
          v-model="internalBind[index].count"
          controls-position="right"
          class="tiny-input-number"
          style="width: 64px"
          step-strictly
          :step="1"
          :min="1"
        />
      </div>
      <div v-if="!modelValue?.length" class="px-2">
        未选择任何物品
      </div>
    </div>

    <el-button :icon="Setting" :type="extraActive ? 'primary' : ''" title="选择物品" circle @click="toggleExtraPanel" />

    <TeleportExtra :active="extraActive">
      <AddonItemSelectorEP v-model="internalBind" />
    </TeleportExtra>
  </div>
</template>

<style lang="scss" scoped>
.marker-item-select {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  transition: border-color var(--el-transition-duration-fast) var(--el-transition-function-ease-in-out-bezier);
  &:hover {
    border-color: var(--el-border-color-hover);
  }
  &.extraActive {
    border-color: var(--el-color-primary);
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
