<script lang="ts" setup>
import type L from 'leaflet'
import { useMarkerCreate } from '../../hooks'
import { MarkerEditorForm } from '.'
import { GlobalDialogController } from '@/hooks'
import { useUserStore } from '@/stores'
import { DialogController } from '@/hooks/useGlobalDialog/dialogController'

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

/** 初始化新增点位信息 */
const initFormData = (): API.MarkerPunctuateVo | API.MarkerVo => {
  const { lat, lng } = props.latlng
  const { name: markerTitle = '', iconTag, itemId } = props.selectedItem ?? {}
  const { id: userId } = userStore.info
  return {
    version: 1,
    author: userId,
    markerTitle,
    content: '',
    hiddenFlag: 0,
    position: `${lat},${lng}`,
    itemList: props.selectedItem ? [{ count: 1, iconTag, itemId }] : [],
    videoPath: '',
    markerCreatorId: userId,
  }
}
/** 表单数据 */
const form = ref(initFormData())

const { loading, createMarker, onSuccess } = useMarkerCreate(form)
onSuccess(() => {
  emits('refresh')
  DialogController.close()
})

/** 表单实例 */
const editorRef = ref<InstanceType<typeof MarkerEditorForm> | null>(null)

const confirm = async () => {
  const isValid = await editorRef.value?.validate().catch(() => false)
  if (!isValid)
    return
  await createMarker()
}
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
