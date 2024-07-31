<script lang="ts" setup>
import { Delete } from '@element-plus/icons-vue'
import { AppIconTagRenderer } from '@/components'
import { useAreaStore, useIconTagStore, useMarkerStore } from '@/stores'
import { HIDDEN_FLAG_NAME_MAP, HiddenFlagEnum } from '@/shared'

defineProps<{
  loading: boolean
  itemList: API.ItemVo[]
  userMap: Record<string, API.SysUserSmallVo>
}>()

defineEmits<{
  selectionChange: [selections: API.ItemVo[]]
  review: [API.ItemVo]
  delete: [API.ItemVo]
}>()

const hiddenFlagTypeMap = {
  [HiddenFlagEnum.SHOW]: 'success',
  [HiddenFlagEnum.HIDDEN]: 'danger',
  [HiddenFlagEnum.NEIGUI]: 'warning',
  [HiddenFlagEnum.EASTER]: 'info',
}

const areaStore = useAreaStore()
const markerStore = useMarkerStore()
const iconTagStore = useIconTagStore()

const markerCountMap = computed(() => markerStore.markerList.reduce((map, { itemList = [] }) => {
  itemList.forEach(({ itemId }) => {
    map.set(itemId!, (map.get(itemId!) ?? 0) + 1)
  })
  return map
}, new Map<number, number>()))
</script>

<template>
  <div
    v-loading="loading"
    element-loading-text="加载中..."
    class="flex-1 px-2 flex justify-center items-center overflow-auto"
  >
    <div class="w-full max-w-[1144px] h-full flex flex-wrap place-content-start gap-2 py-2">
      <div
        v-for="item in itemList"
        :key="item.id"
        class="w-[280px] h-[74px] relative overflow-hidden"
      >
        <div class="item-card" :title="item.name" @click="() => $emit('review', item)">
          <div class="flex flex-col gap-1">
            <AppIconTagRenderer
              :src="iconTagStore.tagSpriteUrl"
              :mapping="iconTagStore.tagCoordMap.get(item.iconTag ?? 'unknown')"
              class="
                w-12 h-12
                flex-shrink-0
                rounded-full
                bg-[var(--el-color-info-light-7)]
                border border-[var(--el-color-info-light-5)]
              "
            />
          </div>

          <div class="w-full h-full overflow-hidden flex flex-col justify-center gap-1 px-2">
            <div class="font-['HYWenHei-85W'] leading-none text-[var(--el-text-color-primary)]">
              {{ item.name }}
            </div>

            <div class="text-xs leading-none text-[var(--el-text-color-regular)] flex items-center overflow-hidden">
              <div class="inline-block max-w-[160px] whitespace-nowrap overflow-hidden text-ellipsis">
                {{ areaStore.areaIdMap.get(item.areaId!)?.name ?? `(id:${item.id})` }}
              </div>
              <div class="flex-shrink-0">
                / {{ markerCountMap.get(item.id!) ?? 0 }}
              </div>
            </div>

            <div class="flex justify-between items-center">
              <el-tag class="w-16" size="small" disable-transitions :type="hiddenFlagTypeMap[item.hiddenFlag as HiddenFlagEnum]">
                {{ HIDDEN_FLAG_NAME_MAP[item.hiddenFlag!] }}
              </el-tag>
            </div>
          </div>
        </div>

        <div
          class="absolute right-0 bottom-0 z-10 pr-1 pb-1"
        >
          <el-button
            circle
            text
            size="small"
            type="danger"
            :icon="Delete"
            title="删除物品"
            style="--el-fill-color-light: var(--el-color-danger-light-9); --el-fill-color: var(--el-color-danger-light-7)"
            @click.stop="() => $emit('delete', item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  @apply
    w-[280px] h-[74px] pl-2 relative
    flex items-center
    border rounded-xl
    cursor-pointer
    select-none
  ;

  &:hover {
    @apply bg-[var(--el-color-primary-light-9)];
  }

  &:active {
    @apply
      active:bg-[var(--el-color-primary-light-7)]
      active:border-[var(--el-color-primary-light-3)]
    ;
  }
}
</style>
