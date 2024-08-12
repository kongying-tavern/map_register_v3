<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash'
import { useMarkerEdit } from './hooks'
import { MarkerEditorForm } from '.'
import { GlobalDialogController } from '@/components'
import db from '@/database'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'

const props = defineProps<{
  markerInfo: GSMapState.MarkerWithRenderConfig
}>()

/** 表单数据 */
const form = ref(cloneDeep(props.markerInfo))

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

// 修改成功后更新外部值
onSuccess(() => {
  const rerenderInfo = createRenderMarkers([form.value], { reset: true })[0]
  if (rerenderInfo)
    form.value = rerenderInfo
  GlobalDialogController.close(form.value)
})

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'
</script>

<template>
  <MarkerEditorForm
    v-if="initAreaCode"
    ref="editorRef"
    v-model="form"
    :title="`${markerInfo.id} ${markerInfo.markerTitle}`"
    :loading="loading"
    :init-area-code="initAreaCode"
    @close="() => GlobalDialogController.close(markerInfo)"
  >
    <template #footer>
      <div class="w-full flex justify-end">
        <el-button :icon="Check" type="primary" :disabled="isOfflineMode" :loading="loading" @click="editMarker">
          保存
        </el-button>
        <el-button :icon="Close" :disabled="loading" @click="() => GlobalDialogController.close(markerInfo)">
          取消
        </el-button>
      </div>
    </template>
  </MarkerEditorForm>
</template>
