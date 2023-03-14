<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useMarkerEdit } from '@/pages/pageMap/hooks'
import { MarkerEditorForm } from '@/pages/pageMap/components'
import { GlobalDialogController } from '@/hooks'
import { useUserStore } from '@/stores'
import { DialogController } from '@/hooks/useGlobalDialog/dialogController'
import { messageFrom } from '@/utils'

const props = defineProps<{
  markerInfo: API.MarkerVo
}>()

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

/** 用户信息 */
const userStore = useUserStore()

/**
 * 初始化新增点位信息
 * MarkerPunctuateVo 相比 MarkerVO 的字段范围更大（只少一个 id），因此使用前者的类型来初始化
 */
const initFormData = (): API.MarkerVo => ({
  ...props.markerInfo,
  version: props.markerInfo.version ? props.markerInfo.version + 1 : 1,
})

/** 表单数据 */
const form = ref(initFormData())

// 管理员直接走点位编辑方法
const { updateMarker, onEditError } = useMarkerEdit(form)
onEditError((err: Error) => ElMessage.error(err.message))

/** 编辑器实例 */
const editorRef = ref<InstanceType<typeof MarkerEditorForm> | null>(null)

/** 表单提交事件 */
const confirm = async () => {
  try {
    const isValid = await editorRef.value?.validate().catch(() => false)
    if (!isValid)
      return
    await editorRef.value?.uploadPicture()
    await updateMarker()
    emits('refresh')
    ElMessage.success('编辑成功')
    DialogController.close()
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
}
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
