<script lang="ts" setup>
import type { Ref } from 'vue'
import { Close, Setting } from '@element-plus/icons-vue'
import { MarkerEditSelectExtraPanel } from '.'

const props = defineProps<{
  modelValue?: API.MarkerItemLinkVo[]
  itemList: API.ItemVo[]
  typeList: API.ItemTypeVo[]
  iconMap: Record<string, string>
  extraVisible: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: API.MarkerItemLinkVo[]): void
  (e: 'update:extraVisible', v: boolean): void
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

const toggleExtraPanel = () => {
  emits('update:extraVisible', !props.extraVisible)
}

const extraPanelRef = inject('extraPanel') as Ref<HTMLElement | null>
</script>

<template>
  <div class="w-full flex gap-1">
    <div
      v-bind="$attrs"
      class="marker-item-select w-full"
      :class="{
        extraVisible,
      }"
    >
      <div
        v-for="item, index in internalBind"
        :key="item.itemId"
        class="w-full rounded flex gap-1 items-center justify-between p-1"
      >
        <img :src="iconMap[item.iconTag as string]" referrerpolicy="no-referrer" class="w-5 h-h object-cover">
        <div class="flex-1 text-ellipsis whitespace-nowrap overflow-hidden" :title="itemMap[item.itemId as number].name">
          {{ itemMap[item.itemId as number].name }}
        </div>
        <el-icon><Close /></el-icon>
        <el-input
          v-model="internalBind[index].count"
          style="width: 60px"
          type="number"
        />
      </div>
      <div v-if="!modelValue?.length">
        未选择任何物品
      </div>
    </div>

    <el-button :icon="Setting" :type="extraVisible ? 'primary' : ''" title="选择物品" circle @click="toggleExtraPanel" />

    <Teleport v-if="extraPanelRef" :to="extraPanelRef">
      <Transition name="fade">
        <MarkerEditSelectExtraPanel
          v-if="props.extraVisible"
          v-model="internalBind"
          :item-list="itemList"
          :type-map="typeMap"
          :icon-map="iconMap"
        />
      </Transition>
    </Teleport>
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
  &.extraVisible {
    border-color: var(--el-color-primary);
  }
}
</style>
