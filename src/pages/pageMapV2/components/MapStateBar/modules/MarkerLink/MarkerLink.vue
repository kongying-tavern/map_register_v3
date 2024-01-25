<script setup lang="ts">
import { useIconTagStore, useMapStateStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { AppIconTagRenderer } from '@/components'

defineProps<{
  linkList: API.MarkerLinkageVo[]
  sourceMarker?: GSMapState.MarkerWithRenderConfig
  targetMarker?: GSMapState.MarkerWithRenderConfig
}>()

const iconTagStore = useIconTagStore()
const mapStateStore = useMapStateStore()

const buildLinkKey = ({ fromId = 0, toId = 0, linkAction }: { fromId?: number; toId?: number; linkAction?: string }) => {
  return `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}-${linkAction}`
}
</script>

<template>
  <div class="w-[400px] min-h-[500px] h-full flex flex-col">
    <div class="border border-red-600 p-1">
      <div class="flex justify-between items-center">
        <div class="flex-1 text-center">
          <span v-if="!sourceMarker">选择源点</span>
          <div v-else>
            <AppIconTagRenderer
              :mapping="iconTagStore.tagPositionMap[sourceMarker.render.mainIconTag]"
              :src="iconTagStore.tagSpriteUrl"
              class="w-8 h-8"
            />
            <div>{{ sourceMarker.markerTitle }}</div>
          </div>
        </div>

        <div class="text-center">
          →
        </div>

        <div class="flex-1 text-center">
          <span v-if="!targetMarker">选择目标点</span>
          <div v-else>
            <AppIconTagRenderer
              :mapping="iconTagStore.tagPositionMap[targetMarker.render.mainIconTag]"
              :src="iconTagStore.tagSpriteUrl"
              class="w-8 h-8"
            />
            <div>{{ targetMarker.markerTitle }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <div v-for="singleLink in linkList" :key="buildLinkKey(singleLink)">
        {{ `${mapStateStore.currentLayerMarkersMap[singleLink.fromId ?? -1]?.markerTitle} (id: ${singleLink.fromId})` }}
        →
        {{ `${mapStateStore.currentLayerMarkersMap[singleLink.toId ?? -1]?.markerTitle} (id: ${singleLink.toId})` }}
      </div>
    </div>

    <div class="flex justify-end p-1">
      <el-button>确认</el-button>
      <el-button>取消</el-button>
    </div>
  </div>
</template>
