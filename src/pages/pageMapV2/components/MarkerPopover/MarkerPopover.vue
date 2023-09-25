<script lang="ts" setup>
import { Check, CirclePlus, DeleteFilled, Edit, Rank, VideoCamera } from '@element-plus/icons-vue'
import { covertPosition } from '../../utils'
import { useCondition, useMarkerFocus } from '../../hooks'
import { MapAffix, MarkerEditPanel } from '..'
import { MarkerPanel } from './components'
import { useMarkerDelete, useMarkerExtra, useMarkerFinished, useMarkerMove, useSkeletonPicture } from './hooks'
import { useIconTagStore, useMapStore } from '@/stores'
import { CloseFilled } from '@/components/GenshinUI/GSIcon'
import { AppBilibiliVideoPlayer, GSButton } from '@/components'
import { useGlobalDialog } from '@/hooks'

const mapStore = useMapStore()
const iconTagStore = useIconTagStore()

const { cachedMarkerVo, focus, blur } = useMarkerFocus()

const { pictureUrl, loading: imageLoading } = useSkeletonPicture(cachedMarkerVo)

const { isFinished } = useMarkerFinished(cachedMarkerVo)

const { isMoving } = useMarkerMove(cachedMarkerVo)

const { isUnderground, hiddenFlagType, refreshTimeType } = useMarkerExtra(cachedMarkerVo)

// ==================== 点位更新时关闭弹窗 ====================
const conditionManager = useCondition()
watch(() => conditionManager.markers, blur)

// ==================== 编辑点位 ====================
const { DialogService } = useGlobalDialog()
const openMarkerEditor = () => {
  focus.value && DialogService
    .config({
      width: 'fit-content',
      alignCenter: true,
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
    })
    .props({
      markerInfo: focus.value,
    })
    .open(MarkerEditPanel)
}

// ==================== 删除点位 ====================
const { confirmDeleteMarker } = useMarkerDelete()

// 预览点位视频
const playBilibiliVideo = () => {
  if (!cachedMarkerVo.value)
    return
  DialogService
    .config({
      alignCenter: true,
      width: 'fit-content',
    })
    .props({
      url: cachedMarkerVo.value.videoPath,
    })
    .open(AppBilibiliVideoPlayer)
}

/** 当前是否存在地图任务 */
const hasMapMission = computed(() => Boolean(mapStore.mission))
</script>

<template>
  <MapAffix v-if="cachedMarkerVo" :pos="covertPosition(cachedMarkerVo.position)" :pickable="Boolean(focus)">
    <MarkerPanel :actived="Boolean(focus)">
      <template #header>
        <img :src="iconTagStore.iconTagMap[cachedMarkerVo.itemList?.[0].iconTag ?? '']?.url" crossorigin="" class="w-7 h-7 object-contain">
        <span class="flex-1 text-lg">
          {{ cachedMarkerVo.markerTitle }}
          <span class="text-sm">（id: {{ cachedMarkerVo.id }}）</span>
        </span>
        <el-icon :size="28" color="#ECE5D8" class="hover:brightness-90 active:brightness-50 cursor-pointer p-1" @click="blur">
          <CloseFilled />
        </el-icon>
      </template>

      <template #picture>
        <el-skeleton style="width: 288px;" :loading="imageLoading" class="aspect-video" animated>
          <template #template>
            <el-skeleton-item variant="image" style="width: 100%; height: 100%;" />
          </template>
          <template #default>
            <img v-if="pictureUrl" :src="pictureUrl" crossorigin="" class="w-72 aspect-video object-cover">
          </template>
        </el-skeleton>
      </template>

      <template #content>
        <p v-for="line in cachedMarkerVo.content?.trim().split('\n')" :key="line" class="leading-6">
          {{ line }}
        </p>
      </template>

      <template #append>
        <div class="flex gap-1 p-2 pt-0">
          <el-tag>{{ isUnderground ? '地下' : '地上' }}</el-tag>
          <el-tag>{{ hiddenFlagType }}</el-tag>
          <el-tag>刷新：{{ refreshTimeType }}</el-tag>
          <el-button v-if="cachedMarkerVo.videoPath" size="small" :icon="VideoCamera" @click="playBilibiliVideo" />
        </div>
      </template>

      <template #footer>
        <GSButton size="small" theme="dark" :disabled="hasMapMission" @click="openMarkerEditor">
          <template #icon>
            <el-icon color="#F7BA3F">
              <Edit />
            </el-icon>
          </template>
          编辑
        </GSButton>

        <GSButton :theme="isFinished ? undefined : 'dark'" class="flex-1" size="small" @click="isFinished = !isFinished">
          <template #icon>
            <el-icon :color="isFinished ? 'var(--el-color-success)' : 'var(--el-color-info)'">
              <component :is="isFinished ? Check : CirclePlus" />
            </el-icon>
          </template>
          {{ isFinished ? '已完成' : '完成' }}
        </GSButton>

        <GSButton :theme="isMoving ? undefined : 'dark'" size="small" title="移动点位" @click="isMoving = !isMoving">
          <template #icon>
            <el-icon color="#F7BA3F">
              <Rank />
            </el-icon>
          </template>
        </GSButton>

        <GSButton size="small" theme="dark" title="删除点位" :disabled="hasMapMission" @click="() => confirmDeleteMarker(cachedMarkerVo)">
          <template #icon>
            <el-icon color="#CF5945">
              <DeleteFilled />
            </el-icon>
          </template>
        </GSButton>
      </template>
    </MarkerPanel>
  </MapAffix>
</template>
