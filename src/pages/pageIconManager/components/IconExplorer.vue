<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useIconTagStore } from '@/stores'

defineProps<{
  tagTypeId: number
  tagList: API.TagVo[]
  loading: boolean
}>()

const iconTagStore = useIconTagStore()

const activedTag = defineModel<API.TagVo | null>('activedTag', {
  required: true,
})

const tableContainerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(tableContainerRef)
const gridItems = computed(() => Math.floor((width.value - 32) / 100))
</script>

<template>
  <div
    ref="tableContainerRef"
    v-loading="loading"
    class="border-r-[1px] border-[var(--el-border-color-light)] h-full overflow-hidden"
    element-loading-text="正在处理..."
    :style="{
      '--sprite-image': `url(${iconTagStore.tagSpriteImage})`,
    }"
  >
    <RecycleScroller
      :items="tagList"
      :grid-items="gridItems"
      :item-size="100"
      :item-secondary-size="100"
      key-field="tag"
      class="h-full"
    >
      <template #default="{ item }">
        <div
          class="grid-item"
          :class="{
            'is-actived': item.tag === activedTag?.tag,
          }"
          @click="activedTag = item"
        >
          <div
            class="item-image"
            :style="{
              '--x': `${-iconTagStore.iconMapping[item.tag]?.[0]}px`,
              '--y': `${-iconTagStore.iconMapping[item.tag]?.[1]}px`,
            }"
          />
          <div class="item-label">
            {{ item.tag }}
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<style scoped>
.grid-item {
  --bg-color: transparent;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  border-radius: 6px;
  background-color: var(--bg-color);
  transition: all ease 100ms;
  border: 1px solid transparent;
  background-clip: padding-box;

  &.is-actived {
    --bg-color: var(--el-color-primary-light-7);
    border-radius: 4px;
  }

  &:not(.is-actived):hover {
    --bg-color: var(--el-color-primary-light-9);
  }

  &:not(.is-actived):active {
    --bg-color: var(--el-color-primary-light-7);
  }
}

.item-image {
  width: 64px;
  height: 64px;
  scale: 0.75;
  background: var(--sprite-image);
  background-position: var(--x) var(--y);
}

.item-label {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  padding: 8px 0;
  color: var(--el-text-color-primary);
}
</style>
