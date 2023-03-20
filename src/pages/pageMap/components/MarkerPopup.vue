<script lang="ts" setup>
import type L from 'leaflet'
import { ElMessageBox } from 'element-plus'
import { ceil } from 'lodash'
import { useMap, useMarkerDelete } from '@/pages/pageMap/hooks'
import { useArchiveStore, useUserStore } from '@/stores'
import { useGlobalDialog } from '@/hooks'
import { MarkerEditPanel } from '@/pages/pageMap/components'

const props = defineProps<{
  markerInfo: API.MarkerVo
  latlng: L.LatLng
}>()

const userStore = useUserStore()
const archiveStore = useArchiveStore()
const { map } = useMap()
const { DialogService } = useGlobalDialog()

const markerForm = toRef(props, 'markerInfo')

const { deleteMarker, onSuccess } = useMarkerDelete(markerForm)

/** 删除事件 */
const onClickDel = async () => {
  const isConfirm = await ElMessageBox.confirm(
    `${userStore.isAdmin ? '操作不可逆' : '删除操作将被提交到审核'}，确认删除点位？`,
    '删除点位',
    { type: 'warning' },
  ).then(() => true).catch(() => false)
  isConfirm && await deleteMarker()
}
onSuccess(() => map.value?.updateMarkers())

const openMarkerEditPanel = () => DialogService
  .config({
    title: `编辑点位：${props.markerInfo.id} - ${props.markerInfo.markerTitle}`,
    width: 'fit-content',
    alignCenter: true,
    closeOnPressEscape: false,
    class: 'transition-all',
  })
  .props({
    markerInfo: props.markerInfo,
  })
  .open(MarkerEditPanel)

/** 标记点位为 已完成/未完成 状态 */
const markerArchived = computed({
  get: () => archiveStore.currentArchive.body.Data_KYJG.has(props.markerInfo.id as number),
  set: (v) => {
    archiveStore.currentArchive.body.Data_KYJG[v ? 'add' : 'delete'](props.markerInfo.id as number)
    map.value?.redrawMarker(props.markerInfo.id)
  },
})
</script>

<template>
  <div class="w-full h-full grid grid-cols-2 gap-2">
    <div class="font-bold col-span-2">
      {{ markerInfo.id }}: {{ markerInfo.markerTitle }} ({{ ceil(latlng.lat) }}, {{ ceil(latlng.lng) }})
    </div>

    <el-image
      v-if="markerInfo.picture"
      :src="markerInfo.picture"
      crossorigin=""
      referrerpolicy="no-referrer"
      alt="点位图像"
      fit="cover"
      class="w-64 h-64 rounded"
    >
      <template #placeholder>
        <div class="w-64 h-64 grid place-items-center border border-stone-900 rounded">
          图片加载中...
        </div>
      </template>
      <template #error>
        <div class="w-64 h-64 grid place-items-center border border-stone-900 rounded">
          图片加载失败
        </div>
      </template>
    </el-image>
    <div v-else class="w-64 h-64 grid place-items-center border border-stone-900 rounded">
      暂无图片
    </div>

    <div class="w-64 h-64 flex flex-col gap-2">
      <div class="w-full flex-1 border border-stone-900 rounded overflow-hidden">
        <el-scrollbar always noresize height="100%">
          <span
            v-for="text in markerInfo.content?.split('\n').filter(Boolean)"
            :key="text"
            class="block p-2"
          >{{ text }}</span>
        </el-scrollbar>
      </div>

      <div class="w-full flex justify-center items-center">
        <el-switch
          v-model="markerArchived"
          inline-prompt
          active-text="已完成"
          inactive-text="未完成"
          class="pr-3"
        />
        <el-button plain class="flex-1" size="small" type="primary" @click="openMarkerEditPanel">
          编辑
        </el-button>
        <el-button plain class="flex-1" size="small" type="danger" @click="onClickDel">
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>
