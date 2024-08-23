<script setup lang="ts">
import { QuestionFilled, Search } from '@element-plus/icons-vue'
import { ElIcon, ElInput, ElPopover, ElSlider } from 'element-plus'
import { AppIconTagRenderer, AppVirtualTable } from '@/components'
import { useIconTagStore } from '@/stores'
import { useState } from '@/hooks'

const iconTagStore = useIconTagStore()

const cacheText = ref('')
const [query, setQuery] = useState('')

const tagList = computed(() => {
  const queryText = toValue(query).trim()
  if (!queryText)
    return iconTagStore.tagList
  return iconTagStore.tagList.filter(({ tag = '' }) => tag.includes(queryText))
})

const modelValue = defineModel<API.MarkerExtra['iconOverride'] | undefined>({
  required: true,
})

/**
 * @note
 * 基于客户端逻辑，zoom+ 表示缩小，zoom- 表示放大。
 */
const zoomRange = computed({
  get: () => {
    if (!modelValue.value)
      return [0, 4]
    const { maxZoom = 0, minZoom = 4 } = modelValue.value
    return [maxZoom, minZoom]
  },
  set: ([maxZoom, minZoom]) => {
    modelValue.value = {
      ...modelValue.value,
      minZoom,
      maxZoom,
    }
  },
})

const marks = Object.fromEntries(Array.from({ length: 5 }).map((_, i) => {
  const num = i
  return [num, `${num}`]
}))

const toggleTag = (tag: API.TagVo) => {
  const value = toValue(modelValue)
  if (!value || value.tag !== tag.tag) {
    const [minZoom, maxZoom] = zoomRange.value
    modelValue.value = { tag: tag.tag!, minZoom, maxZoom }
    return
  }
  modelValue.value = undefined
}
</script>

<template>
  <div class="mb-4">
    <div class="mb-1">
      覆盖图标
    </div>

    <div>
      <ElInput
        v-model="cacheText"
        placeholder="在 全部图标 中搜索..."
        class="mb-1"
        clearable
        @change="setQuery"
      >
        <template #prefix>
          <ElIcon>
            <Search />
          </ElIcon>
        </template>
      </ElInput>

      <div class="h-[258px] flex gap-1 overflow-hidden">
        <AppVirtualTable
          :data="tagList"
          :item-width="48"
          :item-height="48"
          :item-gap="[4, 4]"
          class="w-[268px] flex-shrink-0 rounded border border-[var(--el-border-color)]"
        >
          <template #default="{ item: tag }">
            <div
              class="tag-item"
              :class="{ 'is-actived': modelValue?.tag === tag.tag }"
              @click="() => toggleTag(tag)"
            >
              <ElIcon
                v-if="modelValue?.tag === tag.tag"
                class="checked-anime-in top-0 right-0 bg-[var(--el-color-primary)] rounded-[0_3px_0_4px] p-0.5 z-10"
                style="position: absolute"
                color="var(--el-color-primary-light-7)"
                :size="14"
              >
                <Select />
              </ElIcon>
              <AppIconTagRenderer
                :src="iconTagStore.tagSpriteUrl"
                :mapping="iconTagStore.tagCoordMap.get(tag.tag!)"
                class="w-10 h-10 rounded-[20px] bg-[var(--el-color-info-light-9)]"
              />
            </div>
          </template>
        </AppVirtualTable>

        <div class="flex-1 flex flex-col items-center">
          <div
            class="w-[112px] text-center text-sm flex-shrink-0 pt-4 whitespace-nowrap text-ellipsis overflow-hidden"
            :title="modelValue?.tag"
          >
            {{ modelValue?.tag ?? '<选择图标>' }}
          </div>

          <div class="flex-1 w-full grid place-content-center">
            <div v-if="!modelValue?.tag">
              无
            </div>
            <AppIconTagRenderer
              v-else
              :src="iconTagStore.tagSpriteUrl"
              :mapping="iconTagStore.tagCoordMap.get(modelValue.tag)"
              class="w-16 h-16 rounded bg-[var(--el-color-info-light-9)]"
            />
          </div>
        </div>
      </div>

      <div class="mt-3 flex gap-1 items-center">
        <span>可见放缩级别</span>
        <ElPopover placement="top-start" :width="300">
          <div>
            <div class="font-bold">
              放缩级别说明
            </div>
            <div>4 - 地图缩小到最小时的级别</div>
            <div>0 - 地图放大到最大时的级别</div>
            <div class="font-bold mt-2">
              参考级别
            </div>
            <div>七天神像: 0 ~ 3</div>
            <div>传送锚点: 0 ~ 1</div>
            <div>普通点位: 0 ~ 0.5</div>
          </div>
          <template #reference>
            <ElIcon>
              <QuestionFilled />
            </ElIcon>
          </template>
        </ElPopover>
        <div class="ml-1">
          {{ !modelValue ? '' : `${zoomRange[0]} ~ ${zoomRange[1]}` }}
        </div>
      </div>

      <div class="flex items-center gap-1 px-4 pb-4">
        <ElSlider
          v-model="zoomRange"
          range
          show-stops
          :min="0"
          :max="4"
          :step="0.5"
          :disabled="!modelValue"
          :marks="marks"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes checked-anime-in {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.checked-anime-in {
  transform-origin: 100% 0;
  animation: checked-anime-in 100ms ease-out;
}

.tag-item {
  @apply
    w-full h-full p-1 rounded relative
    flex flex-col
    border border-transparent
    bg-[var(--el-color-info-light-9)]
    cursor-pointer
  ;

  &:hover {
    @apply
      border-[var(--el-color-primary-light-5)]
      bg-[var(--el-color-primary-light-9)]
    ;
  }

  &:active {
    @apply
      border-[var(--el-color-primary-light-5)]
      bg-[var(--el-color-primary-light-7)]
    ;
  }

  &.is-actived {
    @apply
      border-[var(--el-color-primary)]
      bg-[var(--el-color-primary-light-7)]
    ;
  }
}
</style>
