<script lang="ts" setup>
import { Check, CirclePlus, DeleteFilled, Edit, Rank, VideoCamera } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
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

const { hiddenFlagType, refreshTimeText } = useMarkerExtra(cachedMarkerVo)

const idText = computed(() => {
  const id = toValue(cachedMarkerVo)?.id
  if (!id)
    return ''
  return `ID：${id}`
})

const copyId = async () => {
  const idStr = toValue(idText)
  if (!idStr)
    return
  await navigator.clipboard.writeText(idStr)
  ElMessage.success({
    message: `"${idStr}" 已复制到剪贴板`,
    offset: 48,
  })
}

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
  <MapAffix v-if="cachedMarkerVo" :pos="position" :pickable="Boolean(focus)" no-covert-coord integer>
    <template #default="{ zoom }">
      <MarkerPanel :actived="isPopoverActived" :zoom="zoom">
        <template #header>
          <div
            class="
              flex-shrink-0 px-1 rounded-sm
              absolute top-full left-0
              translate-y-1 translate-x-1
              text-xs decoration-dashed underline-offset-2
              text-[#676D7A]
              bg-[#ece5d8de]
              hover:underline
              active:decoration-solid
              cursor-pointer
            "
            @click="copyId"
          >
            {{ idText }}
          </div>

          <AppIconTagRenderer
            class="w-7 h-7 flex-shrink-0"
            :src="tagSpriteUrl"
            :mapping="tagPositionMap[cachedMarkerVo.render.mainIconTag]"
          />

          <div
            class="flex-1 px-1 whitespace-nowrap overflow-hidden text-ellipsis"
            :title="cachedMarkerVo.markerTitle"
          >
            {{ cachedMarkerVo.markerTitle }}
          </div>

          <el-icon
            :size="28"
            color="#ECE5D8"
            class="flex-shrink-0 hover:brightness-90 active:brightness-50 cursor-pointer p-1"
            @click="blur"
          >
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
                <div v-else class="w-64 h-64 grid place-items-center relative bg-[#4A5366] text-[#D3BC8E]">
                  没有图片
                </div>
                <div class="h-6 flex gap-1 absolute bottom-[4px] left-[4px] text-xs z-10">
                  <div
                    v-if="cachedMarkerVo.videoPath"
                    class="
                      w-6 rounded-sm
                      grid place-content-center
                      text-[#676D7A] bg-[#ece5d8de]
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
                  <div class="h-6 px-1 rounded-sm grid place-content-center text-xs text-[#676D7A] bg-[#ece5d8de]">
                    {{ hiddenFlagType }}
                  </div>
                  <div class="h-6 px-1 rounded-sm grid place-content-center text-xs text-[#676D7A] bg-[#ece5d8de]">
                    {{ refreshTimeText }}
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </template>

        <template #content>
          <p v-for="(line, i) in cachedMarkerVo.content?.trim().split('\n')" :key="i" class="leading-5 min-h-[1.5rem] font-[HYWenHei-55S]">
            {{ line }}
          </p>
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
