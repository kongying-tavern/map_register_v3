<script setup lang="ts">
import { Check, Close, Delete, Right } from '@element-plus/icons-vue'
import { MarkerIndicator, MarkerInfo } from './components'
import type { MLContext } from './core'
import { useMapStateStore } from '@/stores'
import { LINK_ACTION_OPTIONS } from '@/shared'
import { mapAffixLayerKey } from '@/pages/pageMapV2/shared'

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

const mapAffixLayerRef = inject(mapAffixLayerKey, ref(null))
</script>

<template>
  <div class="w-[400px] min-h-[500px] h-full flex flex-col">
    <div class="px-1">
      <el-alert>
        选择目标点后，再次点击目标点才能将当前关系加入到关联组
      </el-alert>
    </div>

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
        <el-text>
          合并原有关联
          <el-popover placement="top-start" content="非合并情况下，源点和目标点所在的关联组将被解散，当前关联将形成新的关联组。">
            <template #reference>
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </template>
          </el-popover>
        </el-text>
        <el-switch v-model="isMergeMode" />
      </div>
      <div>
        <el-button :icon="Check" type="primary" disabled>
          确认(开发中)
        </el-button>
        <el-button :icon="Close" @click="context.cancel">
          取消
        </el-button>
      </div>
    </div>

    <Teleport v-if="context.sourceMarker.value" :to="mapAffixLayerRef">
      <MarkerIndicator :marker="context.sourceMarker.value" />
    </Teleport>

    <Teleport v-if="context.targetMarker.value" :to="mapAffixLayerRef">
      <MarkerIndicator :marker="context.targetMarker.value" />
    </Teleport>
  </div>
</template>

<style scoped>
.link-table {
  height: 100%;
  overflow: hidden;
}

.link-item {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
}
</style>
