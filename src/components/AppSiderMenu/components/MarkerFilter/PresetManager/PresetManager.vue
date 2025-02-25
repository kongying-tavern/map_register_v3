<script lang="ts" setup>
import type { MAFGroup, MBFItem } from '@/stores/types'
import { GSButton, GSDivider, GSInput } from '@/components'
import { usePreferenceStore } from '@/stores'
import { PresetCodePanel } from '.'
import { SelectList } from '../../SelectList'
import { usePresets } from '../hooks'

const props = defineProps<{
  modelValue: boolean
  conditions: Map<string, MBFItem> | MAFGroup[]
}>()

const emits = defineEmits<{
  'update:modelValue': [visible: boolean]
}>()

const preferenceStore = usePreferenceStore()

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

// ==================== 侧边栏 ====================
const asideRef = ref<HTMLElement>()

const asideOpen = ref<boolean>(false)

const handleClosed = () => {
  presetName.value = ''
  asideOpen.value = false
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
      :class="[asideOpen ? 'w-[800px]' : '']"
    >
      <div class="text-xl text-center">
        点位筛选条件预设
      </div>

      <GSDivider color="#76716A" />

      <div class="flex gap-3 items-center pb-3">
        <div class="text-white">
          · 预设名称
        </div>
        <GSButton
          class="flex-none"
          size="small"
          @click="() => asideOpen = !asideOpen"
        >
          <template #icon>
            <el-icon :color="asideOpen ? 'var(--gs-color-success)' : 'var(--gs-color-cancel)'">
              <Promotion />
            </el-icon>
          </template>
          分享码
        </GSButton>
      </div>
      <div class="flex gap-2">
        <GSInput v-model="presetName" class="flex-1" placeholder="请输入预设名称" />
        <GSButton icon="submit" :disabled="!presetName" @click="savePreset()">
          保存
        </GSButton>
      </div>

      <div class="flex flex-auto gap-3">
        <div class="flex flex-col flex-1 overflow-hidden">
          <div class="text-white pt-4 pb-2">
            · 预设列表
          </div>
          <el-scrollbar class="flex-1">
            <SelectList
              v-model="presetName"
              class="h-full max-h-0"
              :list="preferenceStore.presets"
              value-key="name"
            >
              <template #default="{ item, isActived }">
                <div :title="item.name" class="w-full flex justify-between items-center overflow-hidden">
                  <div class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {{ item.name }}
                  </div>
                  <div
                    v-if="item.type === 'advanced'"
                    class="flex-shrink-0 rounded text-xs px-1 py-0.5 text-white"
                    :class="isActived ? 'bg-[#3E4556]' : 'bg-[#111821]'"
                    title="该预设为高级筛选的预设"
                  >
                    Pro
                  </div>
                </div>
              </template>
            </SelectList>
          </el-scrollbar>

          <GSDivider color="#76716A" />

          <div class="flex gap-4">
            <GSButton
              :disabled="!presetName"
              class="flex-1"
              @click="deletePreset"
            >
              <template #icon>
                <el-icon color="var(--gs-color-danger)">
                  <DeleteFilled />
                </el-icon>
              </template>
              删除
            </GSButton>
            <GSButton
              :disabled="!presetName"
              class="flex-1"
              icon="submit"
              @click="handlePresetLoad()"
            >
              读取
            </GSButton>
          </div>
        </div>

        <div v-if="asideOpen" class="w-0 mt-4 border-r-[2px] border-r-[#76716A]" />
        <div v-if="asideOpen" ref="asideRef" class="flex flex-col flex-1 overflow-hidden" />
      </div>
    </div>
  </el-dialog>

  <Teleport v-if="asideRef && asideOpen" :to="asideRef">
    <PresetCodePanel
      :preset-name="presetName"
      :conditions="conditions"
      :save-preset="savePreset"
      @imported="() => asideOpen = false"
    />
  </Teleport>
</template>
