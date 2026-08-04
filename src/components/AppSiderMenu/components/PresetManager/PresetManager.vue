<script lang="ts" setup>
import type { FilterConditions } from './types'
import { GSDivider, GSTab } from '@/components'
import { PresetListPanel } from './components'

const props = defineProps<{
  conditions: FilterConditions
}>()

const modelValue = defineModel<boolean>('modelValue', {
  default: false,
})

const tabs: { title: string, value: string }[] = [
  { title: '预设列表', value: 'list' },
]
const activeTab = shallowRef<string>('list')

const previewVisible = shallowRef<boolean>(false)

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
      :class="previewVisible ? 'w-[720px]' : 'w-[400px]'"
    >
      <div class="text-xl text-center">
        点位筛选条件预设
      </div>

      <GSDivider :height="12" />

      <GSTab v-model="activeTab" :tabs="tabs" size="small" theme="dark" class="preset-manager-tab flex-1">
        <template #list>
          <PresetListPanel
            v-model:preview-visible="previewVisible"
            :conditions="props.conditions"
            class="pt-1"
            @load="handlePresetLoad()"
          />
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
