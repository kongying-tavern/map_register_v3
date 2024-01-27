<script setup lang="ts">
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
    <div class="p-1">
      <div class="flex justify-between items-center">
        <MarkerInfo :marker="context.sourceMarker.value" />

        <el-select-v2
          v-model="modelValue"
          :options="LINK_ACTION_OPTIONS"
          style="width: 110px"
        />

        <MarkerInfo :marker="context.targetMarker.value" />
      </div>
    </div>

    <div class="flex-1 overflow-auto text-xs">
      <div v-for="({ fromId = 0, toId = 0, linkAction }) in context.linkList.value" :key="context.getLinkKey({ fromId, toId, linkAction: linkAction as LinkActionEnum })">
        {{ `${mapStateStore.currentLayerMarkersMap[fromId ?? -1]?.markerTitle} (id: ${fromId})` }}
        →
        {{ linkAction }}
        →
        {{ `${mapStateStore.currentLayerMarkersMap[toId ?? -1]?.markerTitle} (id: ${toId})` }}
      </div>
    </div>

    <div class="flex justify-end p-1">
      <el-button>确认</el-button>
      <el-button @click="context.cancel">
        取消
      </el-button>
    </div>
  </div>
</template>
