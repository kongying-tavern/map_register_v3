<script lang="ts" setup>
import { Close, Setting } from '@element-plus/icons-vue'
import { MarkerEditSelectExtraPanel, TeleportExtra } from '.'

const props = defineProps<{
  modelValue?: API.MarkerItemLinkVo[]
  itemList: API.ItemVo[]
  typeList: API.ItemTypeVo[]
  iconMap: Record<string, string>
  extraId: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: API.MarkerItemLinkVo[]): void
  (e: 'update:extraId', v: string): void
}>()

/** 类型 id 与类型对象的映射 */
const typeMap = computed(() => props.typeList.reduce((seed, typeObj) => {
  typeObj.typeId !== undefined && (seed[typeObj.typeId] = typeObj)
  return seed
}, {} as Record<number, API.ItemTypeVo>))

const internalBind = ref(props.modelValue ?? [])
watch(internalBind, v => emits('update:modelValue', v), { deep: true })

const itemMap = computed(() => props.itemList.reduce((seed, item) => {
  item.itemId !== undefined && (seed[item.itemId] = item)
  return seed
}, {} as Record<number, API.ItemVo>))

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
        >
        <div class="flex-1 text-ellipsis whitespace-nowrap overflow-hidden" :title="itemMap[item.itemId as number].name">
          {{ typeMap[itemMap[item.itemId as number].typeIdList?.[0] ?? -1]?.name ?? '未分类' }} - {{ itemMap[item.itemId as number].name }}
        </div>
        <el-icon><Close /></el-icon>
        <el-input-number
          v-model="internalBind[index].count"
          controls-position="right"
          style="width: 80px"
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
      <MarkerEditSelectExtraPanel
        v-model="internalBind"
        :item-list="itemList"
        :type-map="typeMap"
        :icon-map="iconMap"
      />
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
</style>
