<script lang="ts" setup>
import { Check, CirclePlus, DeleteFilled, Edit, Rank, VideoCamera } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useMarkerFocus } from '../../hooks'
import { MapAffix, MarkerEditPanel } from '..'
import { MarkerPanel } from './components'
import { useMarkerDelete, useMarkerExtra, useMarkerFinished, useMarkerMove, useSkeletonPicture } from './hooks'
import { useAccessStore, useIconTagStore, useMapStateStore, useMarkerStore } from '@/stores'
import { CloseFilled } from '@/components/GenshinUI/GSIcon'
import { AppBilibiliVideoPlayer, AppIconTagRenderer, GSButton } from '@/components'
import { useGlobalDialog } from '@/hooks'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'

const accessStore = useAccessStore()
const markerStore = useMarkerStore()
const mapStateStore = useMapStateStore()

const { tagSpriteUrl, tagPositionMap } = storeToRefs(useIconTagStore())

const { cachedMarkerVo, isPopoverActived, focus, blur, updateFocus } = useMarkerFocus()

const { pictureUrl, loading: imageLoading } = useSkeletonPicture(cachedMarkerVo)

const { isFinished, toggle: toggleFinished } = useMarkerFinished(cachedMarkerVo)

const { isMoving, isEnable, position } = useMarkerMove(cachedMarkerVo)

const { hiddenFlagType, refreshTimeType } = useMarkerExtra(cachedMarkerVo)

// 被动点位更新
markerStore.onMarkerUpdate((marker) => {
  if (!cachedMarkerVo.value || marker.id !== cachedMarkerVo.value.id)
    return
  const renderMarker = createRenderMarkers([marker])[0]
  updateFocus(renderMarker.id)
  cachedMarkerVo.value = renderMarker
})

markerStore.onMarkerTweake((markers) => {
  if (!cachedMarkerVo.value)
    return
  const findId = cachedMarkerVo.value.id
  const find = markers.find(({ id }) => findId === id)
  if (!find)
    return
  const renderMarker = createRenderMarkers([find])[0]
  updateFocus(renderMarker.id)
  cachedMarkerVo.value = renderMarker
})

// ==================== 编辑点位 ====================
const { DialogService } = useGlobalDialog()
const openMarkerEditor = async () => {
  if (!focus.value)
    return
  const formData = await DialogService
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
    .afterClosed<GSMapState.MarkerWithRenderConfig>()
  updateFocus(formData.id)
  cachedMarkerVo.value = formData
}

// ==================== 删除点位 ====================
const { confirmDeleteMarker } = useMarkerDelete()

// 预览点位视频
const playBilibiliVideo = (url: string) => {
  DialogService
    .config({
      alignCenter: true,
      width: 'fit-content',
    })
    .props({ url })
    .open(AppBilibiliVideoPlayer)
}

/** 当前是否存在地图任务 */
const hasMapMission = computed(() => Boolean(mapStateStore.mission))
</script>

<template>
  <MapAffix v-if="cachedMarkerVo" :pos="position" :pickable="Boolean(focus)" no-covert-coord>
    <template #default="{ zoom }">
      <MarkerPanel :actived="isPopoverActived" :zoom="zoom">
        <template #header>
          <div
            class="
              py-0.5 px-1 rounded-sm
              absolute top-full left-0
              translate-y-1 translate-x-1
              text-xs
              text-[#676D7A]
              bg-[#ece5d8de]
              font-thin leading-none
            "
          >
            id: {{ cachedMarkerVo.id }}
          </div>
          <AppIconTagRenderer
            class="w-7 h-7"
            :src="tagSpriteUrl"
            :mapping="tagPositionMap[cachedMarkerVo.render.mainIconTag]"
          />
          <div class="flex-1 flex items-center px-1">
            <span class="text-base">
              {{ cachedMarkerVo.markerTitle }}
            </span>
          </div>
          <el-icon :size="28" color="#ECE5D8" class="hover:brightness-90 active:brightness-50 cursor-pointer p-1" @click="blur">
            <CloseFilled />
          </el-icon>
        </template>

        <template #picture>
          <el-skeleton style="width: 256px; height: 256px" :loading="imageLoading" animated>
            <template #template>
              <el-skeleton-item variant="image" style="width: 100%; height: 100%;" />
            </template>
            <template #default>
              <div class="w-64 h-64 relative">
                <el-image
                  v-if="pictureUrl"
                  :src="pictureUrl"
                  :preview-src-list="[pictureUrl]"
                  preview-teleported
                  fit="cover"
                  class="w-64 h-64"
                />
                <div v-else class="w-64 h-64 grid place-items-center bg-[#4A5366] text-[#D3BC8E]">
                  没有图片
                </div>
                <div
                  v-if="cachedMarkerVo.videoPath"
                  class="
                    w-6 h-6 rounded-sm grid place-content-center
                    absolute bottom-[4px] left-[4px]
                    text-xs text-[#676D7A]
                  bg-[#ece5d8de]
                    z-10
                    cursor-pointer
                    hover:bg-[#ece5d8]
                  "
                  title="预览视频"
                  @click="() => playBilibiliVideo(cachedMarkerVo!.videoPath!)"
                >
                  <el-icon :size="20">
                    <VideoCamera />
                  </el-icon>
                </div>
              </div>
            </template>
          </el-skeleton>
        </template>

        <template #content>
          <p v-for="(line, i) in cachedMarkerVo.content?.trim().split('\n')" :key="i" class="leading-6 min-h-[1.5rem]">
            {{ line }}
          </p>
        </template>

        <template #append>
          <div class="flex gap-1 pt-0 p-1">
            <el-tag>{{ hiddenFlagType }}</el-tag>
            <el-tag>{{ refreshTimeType }}</el-tag>
            <el-tag v-if="cachedMarkerVo.linkageId">
              关联
            </el-tag>
          </div>
        </template>

        <template #footer>
          <GSButton
            v-if="accessStore.get('MARKER_EDIT')"
            size="small"
            theme="dark"
            :disabled="hasMapMission"
            @click="openMarkerEditor"
          >
            <template #icon>
              <el-icon color="#F7BA3F">
                <Edit />
              </el-icon>
            </template>
            编辑
          </GSButton>

          <GSButton
            :theme="isFinished ? undefined : 'dark'"
            class="flex-1" size="small"
            @click="toggleFinished"
          >
            <template #icon>
              <el-icon :color="isFinished ? 'var(--el-color-success)' : 'var(--el-color-info)'">
                <component :is="isFinished ? Check : CirclePlus" />
              </el-icon>
            </template>
            {{ isFinished ? '已完成' : '完成' }}
          </GSButton>

          <GSButton
            v-if="accessStore.get('MARKER_EDIT')"
            :theme="isMoving ? undefined : 'dark'"
            size="small"
            :disabled="!isEnable"
            title="移动点位"
            @click="isMoving = !isMoving"
          >
            <template #icon>
              <el-icon color="#F7BA3F">
                <Rank />
              </el-icon>
            </template>
          </GSButton>

          <GSButton
            v-if="accessStore.get('MARKER_DELETE')"
            size="small"
            theme="dark"
            title="删除点位"
            :disabled="hasMapMission"
            @click="() => confirmDeleteMarker(cachedMarkerVo)"
          >
            <template #icon>
              <el-icon color="#CF5945">
                <DeleteFilled />
              </el-icon>
            </template>
          </GSButton>
        </template>
      </MarkerPanel>
    </template>
  </MapAffix>
</template>
