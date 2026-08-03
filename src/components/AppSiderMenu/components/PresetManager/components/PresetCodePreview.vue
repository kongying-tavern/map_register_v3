<script lang="ts" setup>
import type { FilterConditions } from '../types'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { GSButton } from '@/components'
import { usePresetsZip } from '../hooks'

const props = withDefaults(defineProps<{
  conditions: FilterConditions
  title?: string
  tip?: string
}>(), {
  title: '',
  tip: '',
})

const { shareCode } = usePresetsZip(toRef(props, 'conditions'))

const copyCode = async () => {
  if (!shareCode.value)
    return
  await navigator.clipboard.writeText(shareCode.value)
  ElMessage.success({
    message: '分享码已复制到剪贴板',
  })
}
</script>

<template>
  <div class="flex items-center gap-2 pb-2">
    <div v-if="title" class="text-white pr-1">
      · {{ title }}
    </div>
    <GSButton
      size="small"
      title="复制分享码"
      :disabled="!shareCode"
      @click="copyCode()"
    >
      <template #icon>
        <el-icon color="var(--gs-color-success)">
          <DocumentCopy />
        </el-icon>
      </template>
    </GSButton>
  </div>

  <div v-if="tip" class="bg-[#eacd96] mb-2 py-1 text-center text-[#232d3d]">
    {{ tip }}
  </div>

  <el-scrollbar class="flex-1 overflow-hidden">
    <div class="text-wrap break-all max-h-0 pr-1">
      {{ shareCode || '暂无分享码' }}
    </div>
  </el-scrollbar>
</template>
