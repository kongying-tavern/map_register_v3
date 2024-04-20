<script lang="ts" setup>
import type { OverlayChunk, OverlayChunkGroup } from '@/stores'
import { useMapStateStore, useOverlayStore } from '@/stores'

const props = defineProps<{
  data: OverlayControllerChunkGroup
}>()

interface OverlayControllerChunkGroup extends OverlayChunkGroup {
  chunks: OverlayChunk[]
}

const overlayStore = useOverlayStore()
const mapStateStore = useMapStateStore()

const items = computed(() => Map.groupBy(props.data.chunks, ({ item }) => {
  return item
}))

const resetItemVisible = () => {
  items.value.forEach((_, { id }) => {
    overlayStore.visibleItemIds.delete(id)
  })
}

const { update } = mapStateStore.subscribeInteractionInfo('hover', 'overlayChunks')

const updateHover = (chunks: OverlayChunk[] | null) => {
  if (!chunks)
    return update(null)
  update(new Set(chunks.map(({ id }) => id)))
}
</script>

<template>
  <div class="overlay-group">
    <div class="flex justify-between rounded-[4px_4px_0_0] overflow-hidden">
      <div class="py-1 px-2">
        {{ data.name }}
      </div>

      <el-icon
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

    <div class="flex flex-col">
      <el-checkbox
        v-for="([item, chunks]) in items"
        :key="item.id"
        class="overlay-item"
        style="margin-right: 0"
        :model-value="overlayStore.visibleItemIds.has(item.id)"
        @update:model-value="v => overlayStore.visibleItemIds[Boolean(v) ? 'add' : 'delete'](item.id)"
        @pointerenter="() => updateHover(chunks)"
        @pointerleave="() => updateHover(null)"
      >
        {{ item.name }}
      </el-checkbox>
    </div>
  </div>
</template>

<style scoped>
.overlay-group {
  background: #F7F2E8;
  border: 2px solid #D6AD8560;
  color: #495366;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  transition: all ease 100ms;
  &:hover {
    border-color: #D6AD85;
    color: #D6AD85;
  }
}

.overlay-item {
  padding: 0 8px;
  transition: all ease 100ms;
  &:hover {
    background: #D6AD8560;
  }
  &:active {
    background: #D6AD8530;
  }
}
</style>
