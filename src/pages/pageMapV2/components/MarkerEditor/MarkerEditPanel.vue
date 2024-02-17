<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { useMarkerEdit } from '../../hooks'
import { MarkerEditorForm } from '../../components/MarkerEditor'
import { GlobalDialogController } from '@/components'
import db from '@/database'

const props = defineProps<{
  markerInfo: API.MarkerVo
}>()

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
})

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'
</script>

<template>
  <MarkerEditorForm v-if="initAreaCode" ref="editorRef" v-model="form" :loading="loading" :init-area-code="initAreaCode">
    <template #footer>
      <div class="w-full flex justify-end">
        <el-button :icon="Check" type="primary" :disabled="isOfflineMode" :loading="loading" @click="editMarker">
          保存
        </el-button>
        <el-button :icon="Close" :disabled="loading" @click="GlobalDialogController.close">
          取消
        </el-button>
      </div>
    </template>
  </MarkerEditorForm>
</template>
