<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import type { Coordinate2D } from '../../core'
import { useCondition, useMarkerCreate } from '../../hooks'
import { MarkerEditorForm } from '.'
import { GlobalDialogController } from '@/hooks'
import { useUserStore } from '@/stores'
import { DialogController } from '@/hooks/useGlobalDialog/dialogController'
import { messageFrom } from '@/utils'

const props = defineProps<{
  coordinate: Coordinate2D
  selectedItem?: API.ItemVo
}>()

const userStore = useUserStore()
const conditionManager = useCondition()

/** 初始化新增点位信息 */
const initFormData = (): API.MarkerVo => {
  const [x, y] = props.coordinate
  const { name: markerTitle = '', iconTag, id } = props.selectedItem ?? {}
  const { id: userId } = userStore.info
  return {
    version: 1,
    markerTitle,
    content: '',
    hiddenFlag: 0,
    position: `${x},${y}`,
    itemList: props.selectedItem ? [{ count: 1, iconTag, itemId: id }] : [],
    videoPath: '',
    refreshTime: 0,
    markerCreatorId: userId,
  }
}
/** 表单数据 */
const form = ref(initFormData())

const { loading, createMarker, onSuccess } = useMarkerCreate(form)

/** 表单实例 */
const editorRef = ref<InstanceType<typeof MarkerEditorForm> | null>(null)

const confirm = async () => {
  try {
    const isValid = await editorRef.value?.validate()
    if (!isValid)
      return
    await editorRef.value?.uploadPicture()
    await createMarker()
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
}

onSuccess(() => {
  conditionManager.requestMarkersUpdate()
  DialogController.close()
})
</script>

<template>
  <MarkerEditorForm ref="editorRef" v-model="form">
    <template #footer>
      <div class="w-full flex justify-end">
        <el-button :disabled="loading" @click="GlobalDialogController.close">
          取消
        </el-button>
        <el-button :loading="loading" type="primary" @click="confirm">
          {{ userStore.isAdmin ? '确认' : '审核提交' }}
        </el-button>
      </div>
    </template>
  </MarkerEditorForm>
</template>
