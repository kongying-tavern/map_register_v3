<script lang="ts" setup>
import type L from 'leaflet'
import { ElButton, ElMessageBox } from 'element-plus'
import { ceil } from 'lodash'
import { useMarkerDelete } from '@/pages/pageMap/hooks'
import { useUserStore } from '@/stores'

const props = defineProps<{
  markerInfo: API.MarkerVo
  latlng: L.LatLng
}>()

const emits = defineEmits<{
  (e: 'command', v: string): void
  (e: 'refresh'): void
}>()

/** 用户信息 */
const userStore = useUserStore()

const markerInfoRef = toRef(props, 'markerInfo')

const { deleteMarker, onSuccess } = useMarkerDelete(markerInfoRef)

/** 删除事件 */
const onClickDel = async () => {
  const isConfirm = await ElMessageBox.confirm(
    `${userStore.isAdmin ? '操作不可逆' : '删除操作将被提交到审核'}，确认删除点位？`,
    '删除点位',
    { type: 'warning' },
  ).then(() => true).catch(() => false)
  isConfirm && await deleteMarker()
}
onSuccess(() => emits('refresh'))
</script>

<template>
  <div class="w-full h-full flex flex-col gap-2">
    <div class="font-bold">
      {{ markerInfo.id }} - {{ markerInfo.markerTitle }}
    </div>
    <div>({{ ceil(latlng.lat) }}, {{ ceil(latlng.lng) }})</div>
    <img
      v-if="markerInfo.picture"
      :src="markerInfo.picture"
      crossorigin=""
      referrerpolicy="no-referrer"
      alt="点位图像"
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
      <ElButton plain class="flex-1" size="small" type="primary" @click="() => emits('command', 'edit')">
        编辑
      </ElButton>
      <ElButton plain class="flex-1" size="small" type="danger" @click="onClickDel">
        删除
      </ElButton>
    </div>
  </div>
</template>
