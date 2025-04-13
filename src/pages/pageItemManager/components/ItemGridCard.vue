<script setup lang="ts">
import { AppIconTagRenderer } from '@/components'
import { useBinaryFlag, useRefreshTime } from '@/hooks'
import { HIDDEN_FLAG_NAME_MAP, ICON_STYLE_NAME_MAP } from '@/shared'
import { useAreaStore, useIconTagStore } from '@/stores'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  data: API.ItemVo
  count?: number
}>()

const emits = defineEmits<{
  delete: [API.ItemVo]
  review: [API.ItemVo]
}>()

const areaStore = useAreaStore()
const iconTagStore = useIconTagStore()

const areaName = computed(() => {
  const { areaId } = props.data
  return areaStore.areaIdMap.get(areaId!)?.name ?? `(AreaId: ${areaId})`
})

const { humanFriendlyTimeText } = useRefreshTime(computed(() => props.data.defaultRefreshTime), {
  toHumanFriendly: (days, hours) => {
    return `${days} 天 ${hours} 小时`
  },
})

const { isTeleportable, isIconCustomizable, isCaveEntrance } = useBinaryFlag(computed(() => props.data.specialFlag), {
  isTeleportable: 0,
  isIconCustomizable: 1,
  isCaveEntrance: 2,
})

const specialProperties = computed(() => {
  const result: string[] = []
  if (isTeleportable.value)
    result.push('可传送')
  if (isIconCustomizable.value)
    result.push('可自定义图标')
  if (isCaveEntrance.value)
    result.push('洞口')
  return result
})
</script>

<template>
  <div class="item-grid-card" @click="() => emits('review', props.data)">
    <div class="flex">
      <AppIconTagRenderer
        :src="iconTagStore.tagSpriteUrl"
        :mapping="iconTagStore.tagCoordMap.get(props.data.iconTag ?? 'unknown')"
        class="item-icon"
      />

      <div class="mx-3 h-12 flex-1 overflow-hidden" style="contain: layout;">
        <div class="font-[HYWenHei-85W] mb-1">
          {{ data.name }}
        </div>
        <div
          class="text-xs whitespace-nowrap overflow-hidden text-ellipsis"
          :title="areaName"
        >
          {{ areaName }}
        </div>
      </div>

      <div>
        <el-button
          :icon="Delete"
          type="danger"
          size="small"
          plain
          style="padding: 6px 5px"
          @click.stop="() => emits('delete', props.data)"
        />
      </div>
    </div>

    <div class="mt-3 h-4 flex items-center text-xs">
      <div class="inline-sperator">
        {{ ICON_STYLE_NAME_MAP.get(props.data.iconStyleType!) ?? '未知图标类型' }}
      </div>
      <div class="inline-sperator">
        {{ HIDDEN_FLAG_NAME_MAP[props.data.hiddenFlag!] ?? '未知显示类型' }}
      </div>
      <div class="inline-sperator">
        {{ humanFriendlyTimeText }}
      </div>
    </div>

    <div class="mt-2 h-4 flex items-center text-xs">
      <div v-for="property in specialProperties" :key="property" class="inline-sperator">
        {{ property }}
      </div>
    </div>

    <el-divider style="margin: 8px 0" />

    <div class="flex justify-between text-xs">
      <div class="flex-1 shrink-0 flex items-center gap-2">
        <div>
          点位数量
        </div>
        {{ props.count ?? 0 }}
      </div>

      <div class="flex-1 shrink-0 flex items-center gap-2">
        <div>
          排序权重
        </div>
        {{ props.data.sortIndex ?? '未设置' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-grid-card {
  flex-shrink: 0;
  width: 260px;
  padding: 12px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: all ease 100ms;

  &:hover {
    filter: drop-shadow(0 0 4px var(--el-color-primary));
  }
  &:active {
    filter: drop-shadow(0 0 1px var(--el-color-primary));
    border-color: var(--el-color-primary);
  }
}

.item-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #00000020;
  border: 4px solid white;
  outline: 1px solid #00000020;
  overflow: hidden;
}

.inline-sperator {
  display: flex;
  align-items: center;
  &:not(:last-of-type)::after {
    content: '';
    display: inline-block;
    line-height: 16px;
    height: 12px;
    width: 1px;
    background-color: var(--el-border-color);
    margin: 0 10px;
  }
}
</style>
