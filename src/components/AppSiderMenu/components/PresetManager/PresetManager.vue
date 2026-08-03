<script lang="ts" setup>
import type { MAFGroup, MBFItem } from '@/stores/types'
import { GSDivider } from '@/components'
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
      class="genshin-dark-card flex flex-col overflow-hidden font-['HYWenHei-85W'] w-[400px] h-[600px] max-w-[100dvw] max-h-[100dvh]"
    >
      <div class="text-xl text-center">
        点位筛选条件预设
      </div>

      <GSDivider color="#76716A" />

      <PresetListPanel
        v-model:preset-name="presetName"
        @save="savePreset()"
        @delete="deletePreset"
        @load="handlePresetLoad()"
      />
    </div>
  </el-dialog>
</template>
