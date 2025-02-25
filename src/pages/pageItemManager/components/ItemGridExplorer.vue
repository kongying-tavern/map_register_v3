<script lang="ts" setup>
import { AppIconTagRenderer } from '@/components'
import { HIDDEN_FLAG_NAME_MAP, HiddenFlagEnum } from '@/shared'
import { useAreaStore, useIconTagStore, useMarkerStore } from '@/stores'
import { Delete } from '@element-plus/icons-vue'

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
        class="item-card-var w-[280px] h-[74px] relative overflow-hidden"
      >
        <div class="item-card" :title="item.name" @click="() => $emit('review', item)">
          <div class="w-12 h-full flex flex-col justify-center items-center gap-0.5">
            <AppIconTagRenderer
              :src="iconTagStore.tagSpriteUrl"
              :mapping="iconTagStore.tagCoordMap.get(item.iconTag ?? 'unknown')"
              class="
                w-10 h-10
                flex-shrink-0
                rounded-full
                bg-[var(--el-color-info-light-7)]
                border border-[var(--el-color-info-light-5)]
              "
            />
            <el-tag class="w-full" size="small" disable-transitions :type="hiddenFlagTypeMap[item.hiddenFlag as HiddenFlagEnum]">
              {{ HIDDEN_FLAG_NAME_MAP[item.hiddenFlag!] }}
            </el-tag>
          </div>

          <div class="flex-1 h-full overflow-hidden flex flex-col justify-center px-2">
            <div class="font-['HYWenHei-85W'] text-[var(--el-text-color-primary)] overflow-text">
              {{ item.name }}
            </div>

            <div class="text-xs text-[var(--el-text-color-regular)] overflow-text">
              {{ areaStore.areaIdMap.get(item.areaId!)?.name ?? `(id:${item.id})` }}
            </div>

            <div class="text-xs text-[var(--el-text-color-regular)]">
              排序: {{ item.sortIndex ?? 0 }}
            </div>
          </div>
        </div>

        <div
          class="
            absolute right-[1px] top-[1px]
            min-w-[32px] h-5 rounded-[0px_11px_0px_11px]
            grid place-content-center border-l-[1px] border-b-[1px] border-[var(--el-color-warning-light-3)]
            text-xs text-[var(--el-color-warning-dark-2)] bg-[var(--el-color-warning-light-7)]
          "
          title="物品下属点位数量"
        >
          {{ markerCountMap.get(item.id!) ?? 0 }}
        </div>

        <div class="absolute right-0 bottom-0 z-10 pr-1 pb-1">
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
.item-card-var {
  --border-color: var(--el-border-color);
}

.overflow-text {
  @apply max-w-[160px] overflow-hidden whitespace-nowrap text-ellipsis;
}

.item-card {
  @apply
    relative
    w-[280px] h-[74px] pl-2 rounded-xl
    flex items-center
    border border-[var(--border-color)]
    cursor-pointer
    select-none
  ;

  &:hover {
    @apply bg-[var(--el-color-primary-light-9)];
  }

  &:active {
    @apply bg-[var(--el-color-primary-light-7)];
    --border-color: var(--el-color-primary-light-3);
  }
}
</style>
