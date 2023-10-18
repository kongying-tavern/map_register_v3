<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

defineProps<{
  tagTypeId: number
  tagList: API.TagVo[]
  loading: boolean
}>()

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
  >
    <RecycleScroller
      :items="tagList"
      :grid-items="gridItems"
      :item-size="100"
      :item-secondary-size="100"
      key-field="tag"
      class="h-full"
    >
      <template #default="{ item, index }">
        <div
          class="grid-item"
          :class="{
            'is-actived': item.tag === activedTag?.tag,
          }"
          @click="activedTag = item"
        >
          <div class="flex-1 grid place-items-center">
            <el-image
              :src="item.url"
              crossorigin=""
              lazy
              class="w-8 h-8"
              fit="contain"
              :initial-index="index"
            >
              <template #error>
                <el-icon :size="32" color="var(--el-color-danger)">
                  <Close />
                </el-icon>
              </template>
            </el-image>
          </div>
          <div class="w-full overflow-hidden whitespace-nowrap text-ellipsis text-center">
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
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
  padding: 8px;
  background-color: var(--bg-color);
  clip-path: inset(2px 2px round 8px);
  transition: all ease 150ms;

  &.is-actived {
    --bg-color: var(--el-color-primary-light-7);
  }

  &:not(.is-actived):hover {
    --bg-color: var(--el-color-primary-light-5);
  }
}
</style>
