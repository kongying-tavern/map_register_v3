<script lang="ts" setup>
import type { FilterConditions } from './types'
import { GSDivider, GSTab } from '@/components'
import {
  PresetCurrentCodePanel,
  PresetListPanel,
} from './components'

defineProps<{
  conditions: FilterConditions
}>()

const modelValue = defineModel<boolean>('modelValue', {
  default: false,
})

const tabs: { title: string, value: string }[] = [
  { title: '预设列表', value: 'list' },
  { title: '当前分享码', value: 'currentCode' },
]
const activeTab = shallowRef<string>('list')

const presetListPanelRef = useTemplateRef<ComponentExposed<typeof PresetListPanel> | null>('presetListPanelRef')

/** 面板是否应展开：当前标签页可展开，且当前标签页内已展开 */
const isPanelExpanded = computed(() => {
  return (
    activeTab.value === 'list'
    && presetListPanelRef.value?.expanded === true
  )
})

const handlePresetLoad = () => {
  modelValue.value = false
}
</script>

<template>
  <el-dialog
    v-model="modelValue"
    :show-close="false"
    append-to-body
    align-center
    width="fit-content"
    class="custom-dialog hidden-header bg-transparent"
  >
    <div
      class="genshin-dark-card flex flex-col overflow-hidden font-['HYWenHei-85W'] h-[600px] max-w-[100dvw] max-h-[100dvh] transition-[width] duration-200"
      :class="isPanelExpanded ? 'w-[850px]' : 'w-[530px]'"
    >
      <div class="text-xl text-center">
        点位筛选条件预设
      </div>

      <GSDivider :height="12" />

      <GSTab v-model="activeTab" :tabs="tabs" size="small" theme="dark" class="preset-manager-tab flex-1">
        <template #list>
          <PresetListPanel
            ref="presetListPanelRef"
            :conditions="conditions"
            class="pt-1"
            @load="handlePresetLoad()"
          />
        </template>

        <template #currentCode>
          <PresetCurrentCodePanel class="pt-1" />
        </template>
      </GSTab>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.preset-manager-tab {
  :deep(.gs-tab-title) {
    margin-top: 8px;
    margin-bottom: 4px;
  }
}
</style>
