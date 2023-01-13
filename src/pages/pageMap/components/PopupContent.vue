<script lang="ts" setup>
import type { Ref } from 'vue'
import type L from 'leaflet'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { ceil } from 'lodash'
import { useMarkerEdit, useMarkerStage } from '../hooks'
import { MarkerEditForm } from './MarkerEditForm'
import { Logger } from '@/utils'
import { DialogService } from '@/hooks/useGlobalDialog/dialogService'
import { useUserStore } from '@/stores'

const props = defineProps<{
  markerInfo: API.MarkerVo
  latlng: L.LatLng
  iconMap: Ref<API.IconVo[]>
  typeList: Ref<API.ItemTypeVo[]>
  itemList: Ref<API.ItemVo[]>
}>()

const emits = defineEmits<{
  (e: 'clickOutside', v: PointerEvent): void
  (e: 'refresh'): void
}>()

const logger = new Logger('[点位编辑]')

const markerInfoRef = toRef(props, 'markerInfo')

/** 用户信息 */
const userStore = useUserStore()

// 管理员直接走点位删除方法
const { deleteMarker, onDeleteSuccess, onDeleteError } = useMarkerEdit(markerInfoRef)
onDeleteSuccess(() => {
  ElMessage.success('删除成功')
  emits('refresh')
})

onDeleteError((err) => {
  ElMessage.error(err.message)
})

/** 初始化暂存点位信息 */
const punctuateData: API.MarkerPunctuateVo = {
  author: userStore.info.id,
  punctuateId: props.markerInfo.id,
  originalMarkerId: props.markerInfo.id,
  methodType: 3, // 删除
  status: 0,
  version: props.markerInfo.version ? props.markerInfo.version + 1 : 1,
  ...props.markerInfo,
}

/** 通用错误处理 */
const commonErrorHandler = (err: Error) => ElMessage.error(err.message)

// 非管理员走暂存审核方法
const { stageMarker, onStageError, onPushStagedSuccess, onPushStagedError } = useMarkerStage(ref(punctuateData))
onPushStagedSuccess(() => {
  ElMessage.success('提交点位编辑请求成功')
})
onPushStagedError(commonErrorHandler)
onStageError(commonErrorHandler)

/** 编辑事件 */
const onClickEdit = () => {
  DialogService
    .config({
      title: `编辑点位：${props.markerInfo.id} - ${props.markerInfo.markerTitle}`,
      top: '5vh',
      width: 'fit-content',
      class: 'transition-all',
    })
    .props({
      ...props,
    })
    .listeners({
      refresh: () => { emits('refresh') },
    })
    .open(MarkerEditForm)
}

/** 删除事件 */
const onClickDel = async () => {
  try {
    await ElMessageBox.confirm('该操作不可逆，确认删除点位？', '确认操作', {
      type: 'warning',
    })
    // 打点员删除需要过审核
    if (!userStore.isAdmin) {
      await stageMarker()
      return
    }
    // admin直接请求
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
