<script lang="ts" setup>
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { Check, Close, Right } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash'
import { MarkerForm } from './components'
import { useMarkerEdit, useRemoteMarker } from './hooks'

const props = defineProps<{
  markerInfo: GSMapState.MarkerWithRenderConfig
}>()

const emits = defineEmits<{
  close: [GSMapState.MarkerWithRenderConfig]
}>()

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'

/** 表单数据 */
const form = ref(cloneDeep(props.markerInfo))

// 实时更新的远程点位数据
const {
  data: remoteMarker,
  loading: remoteMarkerLoading,
} = useRemoteMarker(computed(() => props.markerInfo.id))

const { editorRef, loading, editMarker, onSuccess } = useMarkerEdit(form)
onSuccess(() => emits('close', form.value))

const idText = computed(() => {
  const { id } = props.markerInfo
  if (!id)
    return ''
  return `ID：${id}`
})

const copyId = async () => {
  if (props.markerInfo?.id === undefined)
    return
  const idStr = `${props.markerInfo?.id}`
  await navigator.clipboard.writeText(idStr)
  ElMessage.success({
    message: `"${idStr}" 已复制到剪贴板`,
  })
}
</script>

<template>
  <MarkerForm
    ref="editorRef"
    v-model="form"
    :title="`${markerInfo.id} ${markerInfo.markerTitle}`"
    :loading="loading"
    @close="() => emits('close', markerInfo)"
  >
    <template #title>
      <div class="flex">
        <div
          class="
            min-w-[80px] px-1 rounded-[2px] flex-shrink-0
            bg-[#3E4556]
            outline outline-[#3E4556] outline-2 -outline-offset-1
            text-sm text-[#CDB78B]
            decoration-[#CDB78B]
            decoration-dashed
            hover:underline
            active:decoration-solid
            cursor-pointer
          "
          @click="copyId"
        >
          {{ idText }}
        </div>

        <div
          class="ml-2 text-sm max-w-[282px] flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
          :title="markerInfo.markerTitle"
        >
          {{ markerInfo.markerTitle }}
        </div>
      </div>
    </template>

    <template #footer>
      <!-- 版本指示器 -->
      <div class="flex-1 flex items-center gap-2">
        <el-tag disable-transitions>
          {{ `本地版本：${markerInfo.version}` }}
        </el-tag>
        <el-icon>
          <Right />
        </el-icon>
        <el-tag disable-transitions>
          {{ `最新版本：${remoteMarkerLoading ? 'Loading...' : Number.isInteger(remoteMarker?.version) ? remoteMarker?.version : '--'}` }}
        </el-tag>
      </div>

      <!-- 操作栏 -->
      <div class="shrink-0 flex justify-end">
        <el-button
          :icon="Check"
          type="primary"
          :disabled="isOfflineMode"
          :loading="loading"
          @click="editMarker"
        >
          保存
        </el-button>
        <el-button
          :icon="Close"
          :disabled="loading"
          @click="() => emits('close', markerInfo)"
        >
          取消
        </el-button>
      </div>
    </template>
  </MarkerForm>
</template>
