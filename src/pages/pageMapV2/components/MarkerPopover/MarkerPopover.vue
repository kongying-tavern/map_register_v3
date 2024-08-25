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
    .props({
      url,
      class: 'w-[640px] h-[360px] rounded overflow-hidden',
    })
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

        <template #prepend>
          <div class="h-8 p-1 flex gap-1 text-xs text-[#676D7A] z-10">
            <div
              class="
                info-tag is-interactive
                decoration-dashed underline-offset-2
                hover:underline
                active:decoration-solid
              "
              @click="copyId"
            >
              {{ idText }}
            </div>
            <div
              v-if="cachedMarkerVo.videoPath"
              class="info-tag is-interactive"
              title="预览视频"
              @click="() => playBilibiliVideo(cachedMarkerVo!.videoPath!)"
            >
              <el-icon :size="20">
                <VideoCamera />
              </el-icon>
            </div>
            <div class="info-tag">
              {{ hiddenFlagType }}
            </div>
            <div v-if="refreshTimeText" class="info-tag">
              {{ refreshTimeText }}
            </div>
          </div>
        </template>

        <template #picture>
          <el-skeleton style="width: 256px; height: 200px" :loading="imageLoading" animated>
            <template #template>
              <el-skeleton-item variant="image" style="width: 100%; height: 100%;" />
            </template>
            <template #default>
              <div
                class="w-64 grid place-content-center bg-[#4A5265] text-[#D3BC8E] transition-[height]"
                :class="pictureUrl ? 'h-[200px]' : 'h-0'"
              >
                <el-image
                  v-if="pictureUrl"
                  :src="pictureUrl"
                  :preview-src-list="[pictureUrl]"
                  preview-teleported
                  fit="cover"
                  style="height: 100%"
                />
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

<style scoped>
.info-tag {
  @apply
    h-6 px-1 rounded-sm
    grid place-content-center
    text-xs
    bg-[#faf5ed]
  ;

  &.is-interactive {
    @apply cursor-pointer;
    &:hover {
      @apply bg-[#ece5d8];
    }
  }
}
</style>
