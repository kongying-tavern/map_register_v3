<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Promotion } from '@element-plus/icons-vue'
import { SelectList } from '../SelectList'
import { usePresets } from './hooks'
import { GSButton, GSDivider, GSInput } from '@/components'
import { usePreferenceStore } from '@/stores'
import type { MAFGroup, MBFItem } from '@/stores/types'

const props = defineProps<{
  modelValue: boolean
  conditions: Map<string, MBFItem> | MAFGroup[]
}>()

defineEmits<{
  'update:modelValue': [visible: boolean]
}>()

const { preference } = storeToRefs(usePreferenceStore())

const presetName = controlledRef('', {
  onBeforeChange: (value) => {
    return !value || value.trim().length === value.length
  },
})

const presetCode = ref<string>('')

const presetCodeStatus = ref<PresetHookOptions['codeStatus']>({
  isUsingSelection: false,
  isGenerating: false,
  isUpdatable: false,
})

const copyPresetCode = async () => {
  if (!presetCode.value)
    return
  await navigator.clipboard.writeText(presetCode.value)
  ElMessage.success({
    message: '分享码已复制到剪贴板',
  })
}

const handleClosed = () => {
  presetName.value = ''
}

const { savePreset, deletePreset, loadPreset } = usePresets({
  nameToSave: presetName,
  nameToLoad: presetName,
  nameToUpdateCode: presetName,
  codeToUpdate: presetCode,
  codeStatus: presetCodeStatus,
  conditionGetter: computed(() => props.conditions),
})
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
      :class="[presetCodeStatus.isUpdatable ? 'w-[800px]' : '']"
    >
      <div class="text-xl text-center">
        点位筛选条件预设
      </div>

      <GSDivider color="#76716A" />

      <div class="flex gap-3 items-center pb-2">
        <div class="text-white">
          · 预设名称
        </div>
        <GSButton
          class="flex-none"
          size="small"
          @click="() => presetCodeStatus.isUpdatable = !presetCodeStatus.isUpdatable"
        >
          分享码
          <template #icon>
            <el-icon :color="presetCodeStatus.isUpdatable ? 'var(--gs-color-success)' : 'var(--gs-color-cancel)'">
              <Promotion />
            </el-icon>
          </template>
        </GSButton>
      </div>
      <div class="flex gap-2">
        <GSInput v-model="presetName" class="flex-auto" placeholder="请输入预设名称" />
        <GSButton icon="submit" :disabled="!presetName" @click="savePreset">
          保存
        </GSButton>
      </div>

      <div class="flex flex-auto gap-3">
        <div class="flex-1 flex flex-col">
          <div class="text-white pt-4 pb-2">
            · 预设列表
          </div>
          <el-scrollbar class="flex-1">
            <SelectList
              v-model="presetName"
              class="h-full overflow-auto"
              :list="preference['markerFilter.setting.presets']!"
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
              @click="loadPreset"
            >
              读取
            </GSButton>
          </div>
        </div>

        <!-- 分享码 -->
        <div v-if="presetCodeStatus.isUpdatable" class="flex flex-col flex-1">
          <div class="flex items-center gap-3 pt-4 pb-2">
            <div class="text-white">
              · 分享码
            </div>
            <GSButton
              :disabled="!presetCode"
              size="small"
              title="复制分享码"
              @click="copyPresetCode"
            >
              <template #icon>
                <el-icon color="var(--gs-color-success)">
                  <DocumentCopy />
                </el-icon>
              </template>
            </GSButton>
          </div>
          <div v-if="!presetCodeStatus.isUsingSelection" class="bg-[#eacd96] mb-2 py-1 text-center text-[#232d3d]">
            此分享码为当前过滤器分享码
          </div>
          <el-scrollbar
            v-loading="presetCodeStatus.isGenerating"
            element-loading-background="#00000070"
            class="flex-1 overflow-hidden"
          >
            <div class="text-wrap break-all max-h-0 pr-1">
              {{ presetCode }}
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
