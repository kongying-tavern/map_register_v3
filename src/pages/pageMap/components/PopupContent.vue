<script lang="ts" setup>
import type L from 'leaflet'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { ceil } from 'lodash'
import { useMarkerEdit } from '../hooks'
import { Logger } from '@/utils'

const props = defineProps<{
  markerInfo: API.MarkerVo
  latlng: L.LatLng
}>()

const emits = defineEmits<{
  (e: 'clickOutside', v: PointerEvent): void
  (e: 'refresh'): void
}>()

const logger = new Logger('[点位编辑]')

const markerInfoRef = toRef(props, 'markerInfo')

const { markerData, deleteMarker, onDeleteSuccess, onDeleteError } = useMarkerEdit(markerInfoRef)

onDeleteSuccess(() => {
  ElMessage.success('删除成功')
  emits('refresh')
})

onDeleteError((err) => {
  ElMessage.error(err.message)
})

// TODO 编辑
const onClickEdit = () => {
  ElMessage.warning(`[开发中] 删除 ${markerData.value.markerTitle}`)
}

const onClickDel = async () => {
  try {
    await ElMessageBox.confirm('该操作不可逆，确认删除点位？', '确认操作', {
      type: 'warning',
    })
    await deleteMarker()
  }
  catch (err) {
    logger.info(err)
  }
}

const containerRef = ref<HTMLElement | null>(null)
onClickOutside(containerRef, (ev) => {
  emits('clickOutside', ev)
})
</script>

<template>
  <div ref="containerRef" class="w-full h-full flex flex-col gap-2">
    <div class="font-bold">
      {{ markerInfo.id }} - {{ markerInfo.markerTitle }}
    </div>
    <div>({{ ceil(latlng.lat) }}, {{ ceil(latlng.lng) }})</div>
    <img
      v-if="markerInfo.picture"
      :src="markerInfo.picture"
      alt="点位说明"
      referrerpolicy="no-referrer"
      class="w-full aspect-square object-cover rounded"
    >
    <div class="w-full">
      <span
        v-for="text in markerInfo.content?.split('\n').filter(Boolean)"
        :key="text"
        class="block pb-1 last:pb-0"
      >{{ text }}</span>
    </div>
    <div class="w-full flex justify-center">
      <ElButton plain class="flex-1" size="small" type="primary" @click="onClickEdit">
        编辑
      </ElButton>
      <ElButton plain class="flex-1" size="small" type="danger" @click="onClickDel">
        删除
      </ElButton>
    </div>
  </div>
</template>
