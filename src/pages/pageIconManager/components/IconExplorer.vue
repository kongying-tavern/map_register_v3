<script setup lang="ts">
import { useIconTagStore } from '@/stores'
import { AppVirtualTable } from '@/components'

const props = defineProps<{
  tagList: API.TagVo[]
  loading: boolean
}>()

const scrollTarget = defineModel<API.TagVo | null>('scrollTarget', {
  required: false,
  default: null,
})

const ICON_SIZE = 100

const iconTagStore = useIconTagStore()

const activedTag = defineModel<API.TagVo | null>('activedTag', {
  required: true,
})

const tableContainerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(tableContainerRef)
const gridItems = computed(() => Math.floor((width.value - 32) / ICON_SIZE))

const scrollTo = (target: API.TagVo | null) => {
  if (!target)
    return

  const scroller = tableContainerRef.value?.firstElementChild
  if (!scroller)
    return

  const tagIndex = props.tagList.findIndex(tag => tag.tag === target.tag)
  if (tagIndex < 0)
    return

  const top = Math.floor(tagIndex / gridItems.value) * ICON_SIZE

  scroller.scrollTo({
    top,
    behavior: 'smooth',
  })
  scrollTarget.value = null
}

watch(scrollTarget, scrollTo)
</script>

<template>
  <div
    ref="tableContainerRef"
    v-loading="loading"
    class="border-r-[1px] border-[var(--el-border-color-light)] h-full overflow-hidden"
    element-loading-text="正在处理..."
    :style="{
      '--sprite-image': `url(${iconTagStore.tagSpriteUrl})`,
    }"
  >
    <AppVirtualTable
      :data="tagList"
      :cached-rows="0"
      :item-height="ICON_SIZE"
      :item-width="ICON_SIZE"
    >
      <template #default="{ item }">
        <div
          class="grid-item"
          :title="item.tag"
          :class="{
            'is-actived': item.tag === activedTag?.tag,
          }"
          @click="activedTag = item"
        >
          <div
            v-if="!iconTagStore.tagPositionMap[item.tag!]"
            class="w-16 h-16 grid place-items-center text-center"
          >
            图片缺省
          </div>
          <div
            v-else
            class="item-image"
            :style="{
              '--x': `${-iconTagStore.tagPositionMap[item.tag!][0]}px`,
              '--y': `${-iconTagStore.tagPositionMap[item.tag!][1]}px`,
            }"
          />
          <div class="item-label">
            {{ item.tag }}
          </div>
        </div>
      </template>
    </AppVirtualTable>
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
    border-radius: 4px;
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
  padding: 8px;
  color: var(--el-text-color-primary);
}
</style>
