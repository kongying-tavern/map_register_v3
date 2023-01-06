<script lang="ts" setup>
import type L from 'leaflet'
import { ElButton, ElMessage } from 'element-plus'
import { ceil } from 'lodash'
import { useMarkerEdit } from '../hooks'
import { messageFrom } from '@/utils'

const props = defineProps<{
  markerInfo: API.MarkerVo
  latlng: L.LatLng
  refresh: any
}>()

const emits = defineEmits<{
  (e: 'clickOutside', v: PointerEvent): void
}>()

// 编辑
const onClickEdit = () => {
  ElMessage.success(props.markerInfo.markerTitle)
  props.refresh()
}

const onClickDel = () => {
  const { deleteMarker, onDeleteSuccess, onDeleteError } = useMarkerEdit(props.markerInfo)
  onDeleteSuccess(() => {
    ElMessage.success('删除成功')
    props.refresh()
  })
  onDeleteError(
    (err) => { ElMessage.error(messageFrom(err)) },
  )
  deleteMarker(props.markerInfo.id)
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
