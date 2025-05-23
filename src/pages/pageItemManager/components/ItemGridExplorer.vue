<script lang="ts" setup>
import { IconLoading } from '@/components/AppIcons'
import { useMarkerStore } from '@/stores'
import {} from '@element-plus/icons-vue'
import ItemGridCard from './ItemGridCard.vue'

defineProps<{
  loading: boolean
  itemList: API.ItemVo[]
  userMap: Record<string, API.SysUserSmallVo>
}>()

const emits = defineEmits<{
  selectionChange: [selections: API.ItemVo[]]
  review: [API.ItemVo]
  delete: [API.ItemVo]
}>()

const markerStore = useMarkerStore()

const markerCountMap = computed(() => markerStore.markerList.reduce((map, { itemList = [] }) => {
  itemList.forEach(({ itemId }) => {
    map.set(itemId!, (map.get(itemId!) ?? 0) + 1)
  })
  return map
}, new Map<number, number>()))
</script>

<template>
  <div
    class="
      flex-1 overflow-auto
      bg-[var(--el-bg-color-page)]
      border-b-[1px] border-[var(--el-border-color-lighter)]
    "
  >
    <div v-if="loading" class="w-full h-full grid place-content-center">
      <el-icon :size="36" color="var(--el-text-color-regular)">
        <IconLoading />
      </el-icon>
    </div>

    <div v-else class="min-h-full p-4 flex gap-4 flex-wrap content-start">
      <ItemGridCard
        v-for="item in itemList"
        :key="item.id"
        :data="item"
        :count="markerCountMap.get(item.id!)"
        @delete="item => emits('delete', item)"
        @review="item => emits('review', item)"
      />
    </div>
  </div>
</template>
