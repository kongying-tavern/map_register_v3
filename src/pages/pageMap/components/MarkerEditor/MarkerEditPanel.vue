<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useMap, useMarkerEdit } from '@/pages/pageMap/hooks'
import { MarkerEditorForm } from '@/pages/pageMap/components'
import { GlobalDialogController } from '@/hooks'
import { useUserStore } from '@/stores'
import { messageFrom } from '@/utils'
import { DialogController } from '@/hooks/useGlobalDialog/dialogController'

const props = defineProps<{
  markerInfo: API.MarkerVo
}>()

const userStore = useUserStore()
const { map } = useMap()

/** 表单数据 */
const form = ref(props.markerInfo)

const { editMarker, onSuccess } = useMarkerEdit(form)

/** 编辑器实例 */
const editorRef = ref<InstanceType<typeof MarkerEditorForm> | null>(null)

/** 表单提交事件 */
const confirm = async () => {
  try {
    const isValid = await editorRef.value?.validate().catch(() => false)
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
  map.value?.updateMarkers()
  DialogController.close()
})
</script>

<template>
  <MarkerEditorForm ref="editorRef" v-model="form">
    <template #footer>
      <div class="w-full flex justify-end">
        <el-button @click="GlobalDialogController.close">
          取消
        </el-button>
        <el-button type="primary" @click="confirm">
          {{ userStore.isAdmin ? '确认' : '提交审核' }}
        </el-button>
      </div>
    </template>
  </MarkerEditorForm>
</template>
