<script lang="ts" setup>
import type { MAFGroup, MBFItem } from '@/stores/types'
import { GSDivider, GSTab } from '@/components'
import { PresetListPanel } from './components'
import { usePresets } from './hooks'

const props = defineProps<{
  modelValue: boolean
  conditions: Map<string, MBFItem> | MAFGroup[]
}>()

const emits = defineEmits<{
  'update:modelValue': [visible: boolean]
}>()

const presetName = controlledRef('', {
  onBeforeChange: (value) => {
    if (!value)
      return true
    else if (!/^[^\\/:*?"'<>|]*$/u.test(value))
      return false
    if (/^\./u.test(value))
      return false
    else if (value.trim().length === value.length)
      return true
    return false
  },
})

const tabs: { title: string, value: string }[] = [
  { title: '预设列表', value: 'list' },
]
const activeTab = shallowRef<string>('list')

const previewVisible = shallowRef<boolean>(false)

const handleClosed = () => {
  presetName.value = ''
}

const { savePreset, deletePreset, loadPreset } = usePresets({
  nameToSave: presetName,
  nameToLoad: presetName,
  conditionGetter: computed(() => props.conditions),
})

const handlePresetLoad = () => {
  loadPreset()
  emits('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :show-close="false"
    append-to-body
    align-center
    width="fit-content"
    class="custom-dialog hidden-header bg-transparent"
    @update:model-value="(v: boolean) => $emit('update:modelValue', v)"
    @closed="handleClosed"
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
            v-model:preset-name="presetName"
            v-model:preview-visible="previewVisible"
            class="pt-1"
            @save="savePreset()"
            @delete="deletePreset"
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
