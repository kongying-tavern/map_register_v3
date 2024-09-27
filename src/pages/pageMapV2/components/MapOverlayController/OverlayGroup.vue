<script lang="ts" setup>
import { ElCheckbox, ElRadio } from 'element-plus'
import type { OverlayChunk, OverlayChunkGroup } from '@/stores'
import { useOverlayStore } from '@/stores'

const props = defineProps<{
  group: OverlayControllerChunkGroup
}>()

interface OverlayControllerChunkGroup extends OverlayChunkGroup {
  chunks: OverlayChunk[]
}

const overlayStore = useOverlayStore()

const items = computed(() => Map.groupBy(props.group.chunks, ({ item }) => {
  return item
}))

const tileModelValue = computed({
  get: () => {
    const item = [...items.value.entries()].find(([{ id: itemId }]) => {
      return overlayStore.activedItemIds.has(itemId)
    })
    if (!item)
      return ''
    return item[0].id
  },
  set: (itemId) => {
    items.value.forEach((_, { id }) => overlayStore.activedItemIds.delete(id))
    overlayStore.activedItemIds.add(itemId)
  },
})

const resetItemVisible = () => {
  items.value.forEach((_, { id }) => {
    overlayStore.activedItemIds.delete(id)
  })
}

const toggleOverlayItem = (itemId: string, bool: boolean) => {
  overlayStore.activedItemIds[bool ? 'add' : 'delete'](itemId)
}
</script>

<template>
  <div class="overlay-group">
    <div class="flex justify-between rounded-[4px_4px_0_0] overflow-hidden">
      <div class="py-1 px-2 w-full flex items-center gap-1 overflow-hidden">
        <div
          class="overflow-hidden whitespace-nowrap text-ellipsis"
          :title="group.name"
        >
          {{ group.name }}
        </div>
        <div
          v-if="group.role === 'tile'"
          class="
            flex-shrink-0
            translate-y-[-1px]
            px-1 pb-0.5 pt-[3px] grid place-items-center
            border border-[#DEA827] rounded
            text-xs text-[#C59A44]
            bg-[#F9ED99]
          "
          title="当前附加图层组属于底图类型，在显示模式上将会区分于普通附加图层"
        >
          底图
        </div>
      </div>

      <el-icon
        v-if="group.multiple"
        class="
          p-2
          cursor-pointer
          hover:bg-[#FF5F4040]
          active:bg-[#FF5F4020]
        "
        color="#FF5F40"
        title="重置图层可见性"
        :size="32"
        @click="resetItemVisible"
      >
        <RefreshLeft />
      </el-icon>
    </div>

    <div class="flex flex-wrap p-1 gap-1">
      <template v-if="!group.multiple">
        <ElRadio
          v-for="([item]) in items"
          :key="item.id"
          v-model="tileModelValue"
          :title="item.name"
          :value="item.id"
          :class="{
            'is-actived': overlayStore.activedItemIds.has(item.id),
          }"
          class="overlay-item"
          style="margin-right: 0"
        >
          <div class="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
            {{ item.name === group.name ? group.name : item.name.replace(group.name, '~') }}
          </div>
        </ElRadio>
      </template>

      <template v-else>
        <ElCheckbox
          v-for="([item]) in items"
          :key="item.id"
          class="overlay-item"
          :class="{
            'is-actived': overlayStore.activedItemIds.has(item.id),
          }"
          style="margin-right: 0"
          :model-value="overlayStore.activedItemIds.has(item.id)"
          :title="item.name"
          @update:model-value="v => toggleOverlayItem(item.id, Boolean(v))"
        >
          <div class="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
            {{ item.name === group.name ? group.name : item.name.replace(group.name, '~') }}
          </div>
        </ElCheckbox>
      </template>
    </div>
  </div>
</template>

<style scoped>
.overlay-group {
  background: #F7F2E8;
  border: 2px solid #D6AD8560;
  color: #495366;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.overlay-item {
  width: 200px;
  color: #495366;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 2px solid transparent;
  background: #D6AD8540;
  border-radius: 4px;

  &:hover {
    border-color: #D6AD8520;
    background: #D6AD8560;
  }
  &:active {
    background: #D6AD8530;
  }

  &.is-actived {
    border-color: #D6AD85;
  }

  :deep(.el-checkbox__label) {
    flex: 1;
    flex: 1;
    display: flex;
    overflow: hidden;
  }
}
</style>
