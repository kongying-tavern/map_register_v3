<script setup lang="ts">
import { Check, Close, RefreshLeft } from '@element-plus/icons-vue'
import { LinkIndicator, MarkerIndicator, MarkerInfo, MarkerSummary } from './components'
import type { MLContext } from './core'
import { useLinkCreate } from './hooks'
import { useMapStateStore } from '@/stores'
import type { LinkActionEnum } from '@/shared'
import { LINK_ACTION_CONFIG, LINK_ACTION_NAME_MAP, LINK_ACTION_OPTIONS } from '@/shared'
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

const showDeleted = computed({
  get: () => props.context.showDeleted.value,
  set: v => props.context.setShowDeleted(v),
})

const mapStateStore = useMapStateStore()

const { addHover, isHover, removeHover } = mapStateStore

const { refresh: submit } = useLinkCreate(props.context)

const mapAffixLayerRef = inject(mapAffixLayerKey, ref())
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="w-full flex flex-col gap-2 px-2 pt-2">
      <div class="flex justify-between items-center">
        <MarkerInfo :marker="context.sourceMarker.value" placeholder="选择源点" color="#FF0" />

        <div class="shrink-0 flex gap-2 items-center flex-col">
          <el-select-v2
            v-model="modelValue"
            :options="LINK_ACTION_OPTIONS"
            style="width: 120px"
            class="px-1"
          >
            <template #default="{ item }">
              <div class="w-full flex gap-1 items-center overflow-hidden">
                <div
                  class="shrink-0 w-1 h-[20px] bg-[var(--color)]"
                  :style="{ '--color': `rgba(${LINK_ACTION_CONFIG[item.value as LinkActionEnum].lineColor.join(',')})` }"
                />
                <div class="overflow-hidden whitespace-nowrap text-ellipsis">
                  {{ item.label }}
                </div>
              </div>
            </template>
          </el-select-v2>

          <div
            :style="{
              '--width': '80%',
              '--color': `rgba(${LINK_ACTION_CONFIG[modelValue].lineColor.join(',')})`,
            }"
            class="arrow-right"
          />
        </div>

        <MarkerInfo :marker="context.targetMarker.value" placeholder="选择目标点" color="#0F0" />
      </div>
    </div>

    <div class="text-xs text-center p-2 flex">
      <el-popover placement="bottom-start" content="非合并情况下，源点和目标点所在的关联组将被解散，当前关联将形成新的关联组。">
        <template #reference>
          <el-checkbox v-model="isMergeMode" label="合并原有关联" />
        </template>
      </el-popover>

      <el-popover placement="bottom-start" content="在列表中显示已经删除的点位关联">
        <template #reference>
          <el-checkbox v-model="showDeleted" label="显示删除项" />
        </template>
      </el-popover>
    </div>

    <div class="flex-1 overflow-hidden text-xs">
      <div class="link-table">
        <div
          v-for="({ fromId = 0, toId = 0, linkAction, key, isDelete }) in context.entireLinkList.value"
          :key="key"
          class="link-item"
          :class="{
            'is-hover': isHover<string>('markerLink', key),
            'is-delete': isDelete,
          }"
          :style="{
            '--color': `rgba(${LINK_ACTION_CONFIG[linkAction].lineColor.join(',')})`,
          }"
          @pointerenter="() => addHover<string>('markerLink', key, true)"
          @pointerleave="() => removeHover<string>('markerLink', key)"
        >
          <MarkerSummary :data="mapStateStore.currentMarkerIdMap.get(fromId!)" />
          <div class="flex-[0.4] flex-shrink-0 text-center flex flex-col items-center overflow-hidden">
            <div>
              {{ LINK_ACTION_NAME_MAP.get(linkAction) }}
            </div>
            <div class="arrow-right" />
          </div>
          <MarkerSummary :data="mapStateStore.currentMarkerIdMap.get(toId!)" />
          <el-button
            text
            circle
            :type="isDelete ? 'success' : 'danger'"
            :title="isDelete ? '撤销删除' : '删除此项关联'"
            :icon="isDelete ? RefreshLeft : Close"
            style="--el-fill-color-light: var(--el-color-danger-light-9); --el-fill-color: var(--el-color-danger-light-7)"
            @click="() => context[isDelete ? 'revokeDeletion' : 'deleteLink']({ key, fromId, toId, linkAction })"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-between p-2">
      <el-text>合计 {{ context.modifiedLinkList.value.length }} 项</el-text>
      <div>
        <el-button
          :icon="Check"
          :disabled="!context.linkList.value.length"
          :loading="context.loading.value"
          type="primary"
          @click="submit"
        >
          确认
        </el-button>
        <el-button
          :icon="Close"
          :disabled="context.loading.value"
          @click="context.cancel"
        >
          取消
        </el-button>
      </div>
    </div>

    <teleport v-if="context.sourceMarker.value" :to="mapAffixLayerRef">
      <MarkerIndicator :marker="context.sourceMarker.value" color="#FF0" />
    </teleport>

    <teleport v-if="context.targetMarker.value" :to="mapAffixLayerRef">
      <MarkerIndicator :marker="context.targetMarker.value" color="#0F0" />
    </teleport>

    <teleport v-if="context.sourceMarker.value && context.targetMarker.value" :to="mapAffixLayerRef">
      <LinkIndicator :source="context.sourceMarker.value" :target="context.targetMarker.value" />
    </teleport>
  </div>
</template>

<style scoped>
.link-table {
  height: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--el-color-primary-light-5);
    border-radius: 6px;
  }
}

.link-item {
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 4px 0 8px;
  padding: 2px 4px;
  background-color: var(--el-color-info-light-9);
  border-radius: 20px;
  position: relative;
  outline-offset: -2px;
  gap: 4px;

  &.is-hover {
    outline: 2px solid #6CE;
  }

  &.is-delete {
    background-color: #FAA;
  }
}

.arrow-right {
  --h: 8px;
  --stroke-width: 1px;
  width: var(--width, 60%);
  height: var(--h);
  position: relative;
  background: var(--color);
  clip-path: polygon(
    0% calc(50% - var(--stroke-width)),
    calc(100% - var(--h)) calc(50% - var(--stroke-width)),
    calc(100% - var(--h)) 0%,
    100% 50%,
    calc(100% - var(--h)) 100%,
    calc(100% - var(--h)) calc(50% + var(--stroke-width)),
    0% calc(50% + var(--stroke-width))
  );
}
</style>
