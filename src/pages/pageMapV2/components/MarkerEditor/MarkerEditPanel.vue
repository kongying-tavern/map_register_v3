<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useCondition, useMarkerEdit } from '../../hooks'
import { MarkerEditorForm } from '../../components/MarkerEditor'
import { messageFrom } from '@/utils'

const props = defineProps<{
  markerInfo: API.MarkerVo | null
  initArea?: API.AreaVo
  visible: boolean
}>()

const emits = defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

const formVisible = computed({
  get: () => props.visible,
  set: v => emits('update:visible', v),
})

const conditionManager = useCondition()

/** 表单数据 */
const form = ref(props.markerInfo ?? {})

const { editMarker, onSuccess } = useMarkerEdit(form)

/** 编辑器实例 */
const editorRef = ref<InstanceType<typeof MarkerEditorForm> | null>(null)

/** 表单提交事件 */
const confirm = async () => {
  try {
    const isValid = await editorRef.value?.validate()
    if (!isValid)
      return
    await editorRef.value?.uploadPicture()
    await editMarker()
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
}

onSuccess(() => {
  conditionManager.requestMarkersUpdate()
  emits('update:visible', false)
})

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'
</script>

<template>
  <el-dialog
    v-model="formVisible"
    width="fit-content"
    class="genshin-marker-edit-dialog"
    align-center
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <template #header>
      <div>{{ markerInfo?.markerTitle }} (id: {{ markerInfo?.id }})</div>
    </template>

    <MarkerEditorForm ref="editorRef" v-model="form" :init-area-code="props.initArea?.code">
      <template #footer>
        <div class="w-full flex justify-end">
          <el-button type="primary" :disabled="isOfflineMode" @click="confirm">
            确认
          </el-button>
          <el-button @click="() => $emit('update:visible', false)">
            取消
          </el-button>
        </div>
      </template>
    </MarkerEditorForm>
  </el-dialog>
</template>

<style lang="scss">
.el-dialog.genshin-marker-edit-dialog {
  border-radius: 8px;
}
</style>
