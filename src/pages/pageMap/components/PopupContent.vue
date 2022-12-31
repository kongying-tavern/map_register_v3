<script lang="ts" setup>
import type L from 'leaflet'
import { ElButton, ElMessage } from 'element-plus'
import { ceil } from 'lodash'

const props = defineProps<{
  markerInfo: API.MarkerVo
  latlng: L.LatLng
}>()

const emits = defineEmits<{
  (e: 'clickOutside', v: PointerEvent): void
}>()

// TODO 按钮具体功能待添加
const onClick = () => {
  ElMessage.success(props.markerInfo.markerTitle)
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
      <ElButton plain class="flex-1" size="small" type="primary" @click="onClick">
        测试按钮
      </ElButton>
      <ElButton plain class="flex-1" size="small" type="danger" @click="onClick">
        测试按钮
      </ElButton>
    </div>
  </div>
</template>
