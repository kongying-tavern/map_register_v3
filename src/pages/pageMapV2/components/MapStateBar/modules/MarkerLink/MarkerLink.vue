<script setup lang="ts">
import { Delete, Right } from '@element-plus/icons-vue'
import { MarkerInfo } from './components'
import type { MLContext } from './core'
import { useMapStateStore } from '@/stores'
import { LINK_ACTION_OPTIONS } from '@/shared'

const props = defineProps<{
  context: MLContext
}>()

const modelValue = computed({
  get: () => props.context.linkAction.value,
  set: v => props.context.setLinkAction(v),
})

const isMergeMode = computed({
  get: () => props.context.isMergeMode.value,
  set: v => props.context.setMergeMode(v),
})

const mapStateStore = useMapStateStore()
</script>

<template>
  <div class="w-[400px] min-h-[500px] h-full flex flex-col">
    <div class="flex justify-between items-center p-1">
      <MarkerInfo :marker="context.sourceMarker.value" placeholder="选择源点" />

      <div class="h-full flex flex-col items-center">
        <div class="flex-1 text-xs flex items-center justify-center">
          源点
          <el-icon class="mx-2">
            <Right />
          </el-icon>
          目标
        </div>
        <el-select-v2
          v-model="modelValue"
          :options="LINK_ACTION_OPTIONS"
          style="width: 110px"
          class="px-1"
        />
      </div>

      <MarkerInfo :marker="context.targetMarker.value" placeholder="选择目标点" />
    </div>

    <div class="flex-1 overflow-hidden text-xs">
      <div class="link-table">
        <el-scrollbar>
          <div
            v-for="({ fromId = 0, toId = 0, linkAction, key }) in context.modifiedLinkList.value"
            :key="key"
            class="link-item"
          >
            <span class="flex-1 text-center">
              {{ `${mapStateStore.currentLayerMarkersMap[fromId ?? -1]?.markerTitle} (id: ${fromId})` }}
            </span>
            <span class="flex-1 text-center">
              {{ linkAction }}
            </span>
            <span class="flex-1 text-center">
              {{ `${mapStateStore.currentLayerMarkersMap[toId ?? -1]?.markerTitle} (id: ${toId})` }}
            </span>
            <el-button text type="danger" size="small" :icon="Delete" @click="() => context.deleteLink(key)" />
          </div>
        </el-scrollbar>
      </div>
    </div>

    <div class="text-xs text-center pt-1">
      当前关联组共有 {{ context.linkList.value.length }} 项关系
    </div>

    <div class="flex justify-between p-1">
      <div class="flex items-center gap-1 pl-1">
        <el-text>合并原有关联</el-text>
        <el-switch v-model="isMergeMode" />
      </div>
      <div>
        <el-button>确认</el-button>
        <el-button @click="context.cancel">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.link-table {
  height: 100%;
  overflow: hidden;
  /* background: var(--el-color-primary-light-7); */
}

.link-item {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
}
</style>
