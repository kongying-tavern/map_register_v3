<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useCondition, useMarkerCreate } from '../../hooks'
import { MarkerEditorForm } from '.'
import { GlobalDialogController } from '@/hooks'
import { useUserStore } from '@/stores'
import { DialogController } from '@/hooks/useGlobalDialog/dialogController'
import { messageFrom } from '@/utils'

const props = defineProps<{
  coordinate: API.Coordinate2D
  initAreaCode?: string
  defaultItem?: API.ItemVo
}>()

const userStore = useUserStore()
const conditionManager = useCondition()

/** 初始化新增点位信息 */
const initFormData = (): API.MarkerVo => {
  const [x, y] = props.coordinate
  const { id: userId } = userStore.info
  return {
    markerTitle: '',
    content: '',
    hiddenFlag: 0,
    position: `${x},${y}`,
    itemList: props.defaultItem
      ? [{
          count: props.defaultItem.defaultCount ?? 1,
          iconTag: props.defaultItem.iconTag,
          itemId: props.defaultItem.id,
        }]
      : [],
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
    ElMessage.error({
      message: `新增点位失败，原因为：${messageFrom(err)}`,
      offset: 48,
    })
  }
}

onSuccess(() => {
  conditionManager.requestMarkersUpdate()
  DialogController.close()
})
</script>

<template>
  <MarkerEditorForm ref="editorRef" v-model="form" :init-area-code="initAreaCode">
    <template #footer>
      <div class="w-full flex justify-end">
        <el-button :loading="loading" type="primary" @click="confirm">
          添加
        </el-button>
        <el-button :disabled="loading" @click="GlobalDialogController.close">
          取消
        </el-button>
      </div>
    </template>
  </MarkerEditorForm>
</template>
