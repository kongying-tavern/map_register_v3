<script lang="ts" setup>
import type { FilterConditions } from '../types'
import { Share } from '@element-plus/icons-vue'
import { GSButton, GSDivider, GSInput } from '@/components'
import { usePreferenceStore } from '@/stores'
import { PresetCodePreview, PresetList } from '.'

const emit = defineEmits<{
  save: []
  delete: []
  load: []
}>()

const presetName = defineModel<string>('presetName', { required: true })

const previewVisible = defineModel<boolean>('previewVisible', { default: false })

const preferenceStore = usePreferenceStore()

const currentPreset = computed(() => {
  return preferenceStore.presets.find(preset => preset.name === presetName.value) ?? null
})

const previewPresetConditions = computed<FilterConditions | null>(() => {
  return currentPreset.value?.conditions ?? null
})

const togglePreviewCode = () => {
  previewVisible.value = !previewVisible.value
}
</script>

<template>
  <div class="flex h-full gap-5">
    <div class="flex flex-col h-full flex-1 overflow-hidden gap-3">
      <PresetList
        v-model:preset-name="presetName"
        title="预设列表"
        :list="preferenceStore.presets"
      >
        <template #header-right>
          <GSButton
            size="small"
            @click="togglePreviewCode()"
          >
            <template #icon>
              <el-icon color="var(--gs-color-confirm)">
                <Share />
              </el-icon>
            </template>
            分享码
          </GSButton>
        </template>
      </PresetList>

      <div class="flex gap-2">
        <GSInput v-model="presetName" class="flex-1" placeholder="请输入预设名称" />
        <GSButton icon="submit" :disabled="!presetName" @click="emit('save')">
          保存
        </GSButton>
      </div>

      <GSDivider :height="24" color="#76716A" />

      <div class="flex gap-4">
        <GSButton
          :disabled="!presetName"
          class="flex-1"
          @click="emit('delete')"
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
          @click="emit('load')"
        >
          读取
        </GSButton>
      </div>
    </div>

    <Transition name="code-preview">
      <div v-if="previewVisible" class="flex gap-5 flex-1 min-w-0">
        <div class="w-px bg-[#76716A]" />
        <div class="flex flex-col flex-1 min-w-0">
          <PresetCodePreview
            :conditions="previewPresetConditions ?? []"
            title="预设分享码"
            tip="再次点击【分享码】按钮可收起预览"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.code-preview-enter-active,
.code-preview-leave-active {
  transition: transform 200ms ease, opacity 200ms ease;
  overflow: hidden;
}

.code-preview-enter-from,
.code-preview-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
