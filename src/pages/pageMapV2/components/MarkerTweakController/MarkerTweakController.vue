<script setup lang="ts">
import { ArrowDown, Check, CirclePlus, Close } from '@element-plus/icons-vue'
import { ElCascaderPanel, ElDropdown } from 'element-plus'
import { useMarkerTweaks, useMultiSelect, useTweaks } from './hooks'
import { ModifierCard, ModifierPreview } from './components'
import { MapWindowTeleporter } from '@/pages/pageMapV2/components'
import { AppIconTagRenderer, AppVirtualTable } from '@/components'
import { useIconTagStore, useItemStore } from '@/stores'
import { pickMainItem } from '@/utils'

const itemStore = useItemStore()
const iconTagStore = useIconTagStore()

const { id, shape, markerList, width, height, isProcessing, finalizeMission, closeWindow, onFinalize } = useMultiSelect({
  windowName: '点位批量操作',
})

const {
  tweakList,
  tweakData,
  tweakOptions,
  modifiedMarkerList,
  selectedIndex,
  selectedModifier,
  selectedMeta,
  createTweak: _createTweak,
  deleteTweak,
  clearTweaks,
} = useTweaks(markerList)

const { submit, isDisabled, loading } = useMarkerTweaks({
  markerList,
  tweakList,
  tweakData,
})

/** @todo 基于 el 组件行为实现，不是很优雅，后期使用独立组件 */
const drownRef = ref<InstanceType<typeof ElDropdown>>()
const cascaderPanelRef = ref<InstanceType<typeof ElCascaderPanel>>()

const createTweak = (value?: string[]) => {
  _createTweak(value)
  drownRef.value?.handleClose()
  cascaderPanelRef.value?.clearCheckedNodes()
}

onFinalize(() => {
  clearTweaks()
})
</script>

<template>
  <div class="marker-multiselect-controller absolute left-0 top-0 w-full h-full">
    <svg v-if="shape" :viewBox="`0 0 ${width} ${height}`" fill="transparent">
      <rect
        :x="shape.xmin"
        :y="shape.ymin"
        :width="shape.width"
        :height="shape.height"
        stroke="yellow"
        stroke-width="2"
      />
    </svg>

    <div v-if="isProcessing" class="mission-info">
      <p class="text-lg font-bold">
        多选点位
      </p>
      - 按住 <span class="keyboard-key mb-1">Ctrl</span> 选择点位<br>
      - 按住 <span class="keyboard-key">Ctrl</span> + <span class="keyboard-key">Alt</span> 取消选择点位。
    </div>

    <MapWindowTeleporter :id="id" @close="finalizeMission">
      <div class="h-full flex overflow-hidden p-2">
        <div class="h-full w-[300px] flex flex-col pr-2">
          <div class="pb-2">
            <ElDropdown ref="drownRef" placement="bottom-start" trigger="click" :teleported="false">
              <el-button :icon="CirclePlus">
                添加编辑操作
                <el-icon class="el-icon--right" :size="12">
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <ElCascaderPanel
                  ref="cascaderPanelRef"
                  :options="tweakOptions"
                  @change="createTweak"
                />
              </template>
            </ElDropdown>
          </div>

          <div class="flex-1 flex-shrink-0 flex flex-col gap-2 overflow-auto">
            <div
              v-for="(tweak, index) in tweakList"
              :key="tweak.id"
            >
              <ModifierCard
                v-model:selected-index="selectedIndex"
                :modifier="tweak.modifier"
                :index="index"
                :model-value="tweakData.get(tweak.id)!"
                @update:model-value="value => tweakData.set(tweak.id, value)"
                @remove="() => deleteTweak(index)"
              />
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <el-button :loading="loading" :disabled="isDisabled" :icon="Check" type="primary" @click="submit">
              应用
            </el-button>
            <el-button :icon="Close" @click="closeWindow">
              取消
            </el-button>
          </div>
        </div>

        <div class="flex-1 h-full flex flex-col overflow-hidden rounded bg-[var(--el-fill-color-light)]">
          <div class="flex h-8 items-center text-xs ml-2 mr-3 border-b-[1px] border-[var(--el-border-color)]">
            <div class="w-16 mx-2 ml-4 text-center">
              点位
            </div>
            <el-divider direction="vertical" style="height: 100%" />
            <div v-if="!selectedModifier" class="flex-1 text-center">
              请添加编辑操作
            </div>
            <template v-else>
              <div class="flex-1">
                {{ selectedModifier.options.label }}
              </div>
              <el-divider direction="vertical" style="height: 100%" />
              <div class="flex-1">
                {{ selectedModifier.options.replaceLabel }}
              </div>
            </template>
          </div>

          <AppVirtualTable
            :data="modifiedMarkerList"
            :item-height="selectedModifier?.options.previewHeight ?? 32"
            :cached-rows="1"
            class="flex-1 overflow-hidden"
          >
            <template #default="{ item: { oldData, newData }, index }">
              <div
                class="h-full overflow-hidden text-sm flex items-center border-[var(--el-border-color)] ml-2 mr-3 bg-clip-content"
                :class="index < modifiedMarkerList.length - 1 ? 'border-b-[1px]' : ''"
              >
                <div class="w-10 text-xs text-right">
                  {{ newData.id }}
                </div>
                <div class="w-6 mx-2 ml-4">
                  <AppIconTagRenderer
                    :mapping="iconTagStore.tagPositionMap[pickMainItem(newData, itemStore.itemIdMap).mainIconTag]"
                    :src="iconTagStore.tagSpriteUrl"
                    class="w-6 h-6"
                  />
                </div>
                <el-divider direction="vertical" style="height: 100%" />
                <div v-if="!selectedModifier" class="flex-1 text-center text-xs text-[var(--el-text-color-secondary)]">
                  no action
                </div>
                <template v-else>
                  <div class="h-full flex-1 overflow-hidden">
                    <ModifierPreview :modifier="selectedModifier" :data="oldData" :meta="selectedMeta!" />
                  </div>
                  <el-divider direction="vertical" style="height: 100%" />
                  <div class="h-full flex-1 overflow-hidden">
                    <ModifierPreview :modifier="selectedModifier" :data="newData" :old-data="oldData" :meta="selectedMeta!" />
                  </div>
                </template>
              </div>
            </template>
          </AppVirtualTable>
        </div>
      </div>
    </MapWindowTeleporter>
  </div>
</template>

<style scoped>
.marker-multiselect-controller {
  z-index: 1;
  pointer-events: none;
}

@keyframes multiselect-anime-in {
  from {
    transform: translateX(calc(100% + 8px));
  }
  to {
    transform: translateX(0px);
  }
}

.mission-info {
  @apply
    absolute right-1 bottom-[48px] p-2 px-3
    border border-[#ECE5D820] rounded
    text-sm text-[#C6C2BA]
    bg-[#263240]
  ;
  animation: multiselect-anime-in ease 150ms;
}

.keyboard-key {
  @apply
    inline-block p-px px-1
    border border-[#C6C2BA] rounded
    text-xs
  ;
}
</style>
