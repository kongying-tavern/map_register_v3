<script lang="ts" setup>
import { useCondition, useMarkerEdit } from '../../hooks'
import { MarkerEditorForm } from '../../components/MarkerEditor'
import { GlobalDialogController } from '@/hooks'
import db from '@/database'

const props = defineProps<{
  markerInfo: API.MarkerVo
}>()

const conditionManager = useCondition()

/** 表单数据 */
const form = ref(props.markerInfo ?? {})

const initAreaCode = asyncComputed(async () => {
  if (!form.value.itemList)
    return
  const item = await db.item.get(form.value.itemList[0].itemId!)
  if (!item)
    return
  const area = await db.area.get(item.areaId!)
  return area?.code
}, undefined)

const { editorRef, loading, editMarker, onSuccess } = useMarkerEdit(form)

onSuccess(() => {
  GlobalDialogController.close()
  conditionManager.requestMarkersUpdate()
})

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'
</script>

<template>
  <MarkerEditorForm v-if="initAreaCode" ref="editorRef" v-model="form" :init-area-code="initAreaCode">
    <template #footer>
      <div class="w-full flex justify-end">
        <el-button type="primary" :disabled="isOfflineMode" :loading="loading" @click="editMarker">
          确认
        </el-button>
        <el-button @click="GlobalDialogController.close">
          取消
        </el-button>
      </div>
    </template>
  </MarkerEditorForm>
</template>
