<script setup lang="ts">
import { Right } from '@element-plus/icons-vue'
import { MarkerInfo } from './components'
import type { MLContext } from './core'
import { useMapStateStore } from '@/stores'
import type { LinkActionEnum } from '@/shared'
import { LINK_ACTION_OPTIONS } from '@/shared'

const props = defineProps<{
  context: MLContext
}>()

const modelValue = computed({
  get: () => props.context.linkAction.value,
  set: v => props.context.setLinkAction(v),
})

const mapStateStore = useMapStateStore()
</script>

<template>
  <div class="w-[400px] min-h-[500px] h-full flex flex-col">
    <div class="flex justify-between items-center p-1">
      <MarkerInfo :marker="context.sourceMarker.value" />

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

      <MarkerInfo :marker="context.targetMarker.value" />
    </div>

    <div class="flex-1 overflow-hidden text-xs">
      <div class="link-table">
        <el-scrollbar>
          <div
            v-for="({ fromId = 0, toId = 0, linkAction }) in context.linkList.value"
            :key="context.getLinkKey({ fromId, toId, linkAction: linkAction as LinkActionEnum })"
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
          </div>
        </el-scrollbar>
      </div>
    </div>

    <div class="text-xs text-center pt-1">
      当前关联组共有 {{ context.linkList.value.length }} 项关系
    </div>

    <div class="flex justify-end p-1">
      <el-button>确认</el-button>
      <el-button @click="context.cancel">
        取消
      </el-button>
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
  justify-content: space-between;
  padding: 4px;
}
</style>
