<script lang="ts" setup>
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash'
import { MarkerForm } from './components'
import { useMarkerEdit } from './hooks'

const props = defineProps<{
  markerInfo: GSMapState.MarkerWithRenderConfig
}>()

const emits = defineEmits<{
  close: [GSMapState.MarkerWithRenderConfig]
}>()

/** 表单数据 */
const form = ref(cloneDeep(props.markerInfo))

const { editorRef, loading, editMarker, onSuccess } = useMarkerEdit(form)

// 修改成功后更新外部值
onSuccess(() => {
  const rerenderInfo = createRenderMarkers([form.value], { reset: true })[0]
  if (rerenderInfo)
    form.value = rerenderInfo
  emits('close', form.value)
})

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'

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
    center: true,
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
      <div class="w-full flex justify-end">
        <el-button :icon="Check" type="primary" :disabled="isOfflineMode" :loading="loading" @click="editMarker">
          保存
        </el-button>
        <el-button :icon="Close" :disabled="loading" @click="() => emits('close', markerInfo)">
          取消
        </el-button>
      </div>
    </template>
  </MarkerForm>
</template>
