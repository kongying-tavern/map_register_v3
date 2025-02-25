<script lang="ts" setup>
import type { MAFGroup, MBFItem } from '@/stores/types'
import { GSButton, GSDivider } from '@/components'
import { CloseBold, DocumentCopy, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePresetsCode } from '../hooks'

const props = defineProps<{
  conditions: Map<string, MBFItem> | MAFGroup[]
  savePreset: (conditions: Map<string, MBFItem> | Record<string, MBFItem> | MAFGroup[]) => void
}>()

const emits = defineEmits<{
  imported: []
}>()

const presetName = defineModel<string>('presetName')

const importEditCode = ref<string>('')

const isEditingCode = ref<boolean>(false)

const handleImportOn = () => {
  isEditingCode.value = true
  importEditCode.value = ''
}

const {
  shareCode,
  isUsingFilter,
  importCode,
} = usePresetsCode({
  nameToPreview: presetName,
  nameToImport: presetName,
  importCallback: (success) => {
    if (success) {
      isEditingCode.value = false
      importEditCode.value = ''
      emits('imported')

      ElMessage.success({
        message: '导入分享码成功',
      })
    }
    else {
      ElMessage.error({
        message: '导入分享码失败，请检查分享码',
      })
    }
  },
  conditionGetter: computed(() => props.conditions),
  presetSaver: props.savePreset,
})

const copyCode = async () => {
  if (!shareCode.value)
    return
  await navigator.clipboard.writeText(shareCode.value)
  ElMessage.success({
    message: '分享码已复制到剪贴板',
  })
}

// ==================== 自适应 textarea 行高 ====================
const textareaContainerRef = ref<HTMLElement>()
const { height } = useElementSize(textareaContainerRef)
const textareaRows = computed(() => Math.floor((height.value - 20) / 19))
</script>

<template>
  <div class="flex items-center gap-2 pt-4 pb-2">
    <div class="text-white pr-1">
      · 分享码
    </div>
    <template v-if="!isEditingCode">
      <GSButton
        size="small"
        title="复制分享码"
        @click="copyCode()"
      >
        <template #icon>
          <el-icon color="var(--gs-color-success)">
            <DocumentCopy />
          </el-icon>
        </template>
      </GSButton>
      <GSButton size="small" @click="handleImportOn()">
        <template #icon>
          <el-icon color="var(--gs-color-confirm)">
            <Edit />
          </el-icon>
        </template>
        导入
      </GSButton>
    </template>
  </div>

  <template v-if="!isEditingCode">
    <div v-if="isUsingFilter" class="bg-[#eacd96] mb-2 py-1 text-center text-[#232d3d]">
      此分享码为当前过滤器分享码
    </div>
    <el-scrollbar class="flex-1 overflow-hidden">
      <div class="text-wrap break-all max-h-0 pr-1">
        {{ shareCode }}
      </div>
    </el-scrollbar>
  </template>
  <template v-else>
    <div ref="textareaContainerRef" class="flex-1">
      <el-input
        v-model="importEditCode"
        type="textarea"
        resize="none"
        placeholder="请输入分享码"
        :rows="textareaRows"
      />
    </div>

    <GSDivider color="#76716A" />

    <div class="flex flex-none gap-4">
      <GSButton
        class="flex-1"
        @click="() => isEditingCode = false"
      >
        <template #icon>
          <el-icon color="var(--gs-color-cancel)">
            <CloseBold />
          </el-icon>
        </template>
        取消
      </GSButton>
      <GSButton
        :disabled="!presetName || !importEditCode"
        class="flex-1"
        @click="importCode(importEditCode)"
      >
        <template #icon>
          <el-icon color="var(--gs-color-confirm)">
            <Download />
          </el-icon>
        </template>
        导入
      </GSButton>
    </div>
  </template>
</template>
