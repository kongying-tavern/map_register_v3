<script lang="ts" setup>
import type L from 'leaflet'
import { ElMessage } from 'element-plus'
import { useMarkerEdit, useMarkerStage } from '../../hooks'
import { MarkerEditor } from '.'
import { GlobalDialogController } from '@/hooks'
import { useUserStore } from '@/stores'
import type { ElFormType } from '@/shared'
import { DialogController } from '@/hooks/useGlobalDialog/dialogController'
import { messageFrom } from '@/utils'

const props = defineProps<{
  latlng: L.LatLng
  selectedItem?: API.ItemVo
  selectedArea?: API.AreaVo
}>()

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

/** 用户数据 */
const userStore = useUserStore()

/**
 * 初始化新增点位信息
 * MarkerPunctuateVo 相比 MarkerVO 的字段范围更大（只少一个 id），因此使用前者的类型来初始化
 */
const initFormData = (): API.MarkerPunctuateVo | API.MarkerVo => {
  const { lat, lng } = props.latlng
  const { defaultContent, name: markerTitle = '' } = props.selectedItem ?? {}
  const { info } = userStore
  return {
    version: 1,
    author: info.id,
    markerTitle,
    content: defaultContent,
    hiddenFlag: 0,
    position: `${lat},${lng}`,
    itemList: props.selectedItem
      ? [{
          count: 1,
          iconTag: props.selectedItem.iconTag,
          itemId: props.selectedItem.itemId,
        }]
      : [],
    videoPath: '',
    markerCreatorId: info.id,
    methodType: 1,
    status: 0,
  }
}

/** 表单数据 */
const form = ref(initFormData())

/** 通用错误处理 */
const commonErrorHandler = (err: Error) => ElMessage.error(err.message)

// 非管理员走暂存审核方法
const { stageLoading, stageMarker, onStageError, onPushStagedSuccess, onPushStagedError } = useMarkerStage(form)
onPushStagedSuccess(() => {
  ElMessage.success('点位提交审核成功')
})
onPushStagedError(commonErrorHandler)
onStageError(commonErrorHandler)

// 管理员直接走点位创建方法
const { createLoading, createMarker, onCreateSuccess, onCreateError } = useMarkerEdit(form)
onCreateSuccess((res) => {
  ElMessage.success(`点位创建成功, ID 为 ${res.data}`)
  emits('refresh')
})
onCreateError(commonErrorHandler)

const loading = computed({
  get: () => userStore.isAdmin ? createLoading.value : stageLoading.value,
  set: v => userStore.isAdmin ? (createLoading.value = v) : (stageLoading.value = v),
})

/** 点位提交API */
const commitMarker = async () => {
  // admin, 点位提交
  if (userStore.isAdmin) {
    await createMarker()
    return true
  }
  // 打点员，点位暂存
  await stageMarker()
  return true
}

/** 表单实例 */
const formRef = ref<ElFormType | null>(null)

const confirm = async () => {
  try {
    loading.value = true
    // 校验
    const isValid = await formRef.value?.validate().catch(() => false)
    if (!isValid)
      return
    const createRes = await commitMarker()
    if (isValid && createRes)
      DialogController.close()
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <MarkerEditor v-model="form">
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
  </MarkerEditor>
</template>
