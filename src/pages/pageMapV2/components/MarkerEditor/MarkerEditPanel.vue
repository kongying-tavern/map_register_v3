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

const conditionManager = useCondition()

const areaCode = ref(props.initArea?.code ?? '')

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
    :model-value="visible"
    width="fit-content"
    class="genshin-marker-edit-dialog"
    align-center
    @update:model-value="v => $emit('update:visible', v)"
  >
    <template #header>
      <div>{{ initArea?.name }}</div>
    </template>

    <MarkerEditorForm ref="editorRef" v-model="form" :area-code="areaCode">
      <template #footer>
        <div class="w-full flex justify-end">
          <el-button @click="() => $emit('update:visible', false)">
            取消
          </el-button>
          <el-button type="primary" :disabled="isOfflineMode" @click="confirm">
            确认
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
