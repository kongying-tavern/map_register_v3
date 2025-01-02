<script lang="ts" setup>
import { Check, CirclePlus, DeleteFilled, Edit, Rank, VideoCamera } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { MarkerEditor } from '../MarkerModifyer'
import { MapAffix } from '../MapAffix'
import { MarkerPanel } from './components'
import { useMarkerDelete, useMarkerExtra, useMarkerFinished, useMarkerMove } from './hooks'
import { useGlobalDialog, useMarkerControl } from '@/hooks'
import { useAccessStore, useIconTagStore, useMapStateStore, useMarkerStore } from '@/stores'
import { CloseFilled } from '@/components/GenshinUI/GSIcon'
import { AppBilibiliVideoPlayer, AppIconTagRenderer, GSButton } from '@/components'
import { createRenderMarkers } from '@/stores/utils'
import type { GSMarkerInfo } from '@/packages/map'

const accessStore = useAccessStore()
const markerStore = useMarkerStore()
const mapStateStore = useMapStateStore()

const { tagSpriteUrl, tagPositionMap } = storeToRefs(useIconTagStore())

const { cachedMarkerVo, isPopoverActived, focus, blur, updateFocus } = useMarkerControl()

const { isFinished, toggle: toggleFinished } = useMarkerFinished(cachedMarkerVo)

const { isMoving, isEnable, position } = useMarkerMove(cachedMarkerVo)

const { hiddenFlagType, refreshTimeText } = useMarkerExtra(cachedMarkerVo)

const copyId = async () => {
  if (cachedMarkerVo.value?.id === undefined)
    return
  const idStr = `${cachedMarkerVo.value.id}`
  await navigator.clipboard.writeText(idStr)
  ElMessage.success({
    message: `ID "${idStr}" 已复制到剪贴板`,
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

const {
  isEnable: isEditable,
  update: updateEditting,
  clear: clearEditting,
} = mapStateStore.subscribeMission('markerEditting', () => undefined)

const editMarker = async () => {
  if (!isEditable.value || !focus.value)
    return
  updateEditting(focus.value.id)
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
    .open(MarkerEditor)
    .afterClosed<GSMarkerInfo>()
  clearEditting()
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
  <MapAffix :pos="position" :pickable="Boolean(focus)" no-covert-coord integer>
    <template v-if="cachedMarkerVo" #default="{ zoom }">
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

        <template #picture>
          <div v-if="cachedMarkerVo.picture" class="w-[256px] h-[256px] overflow-hidden p-2">
            <el-image
              :src="cachedMarkerVo.picture"
              :preview-src-list="[cachedMarkerVo.picture]"
              preview-teleported
              fit="contain"
              style="width: 100%; height: 100%; border-radius: 4px"
            >
              <template #placeholder>
                <el-skeleton style="width: 256px; height: 256px" loading animated>
                  <template #template>
                    <el-skeleton-item variant="image" style="width: 100%; height: 100%;" />
                  </template>
                </el-skeleton>
              </template>
            </el-image>
          </div>
        </template>

        <template #append>
          <div class="p-1 flex flex-wrap gap-1 text-xs mx-1 rounded bg-[#4A526540] text-[#676D7A] font-[HYWenHei-55S]">
            <div
              class="
                info-tag is-interactive
                decoration-dashed underline-offset-2
                hover:underline
                active:decoration-solid
              "
              @click="copyId"
            >
              ID {{ cachedMarkerVo.id }}
            </div>
            <div class="info-tag">
              {{ hiddenFlagType }}
            </div>
            <div class="info-tag">
              {{ refreshTimeText || '不刷新' }}
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
          </div>
        </template>

        <template #content>
          <textarea
            :value="cachedMarkerVo.content"
            readonly
            :rows="cachedMarkerVo.picture ? 8 : 16"
            class="custom-scrollbar block p-1 text-sm outline-none resize-none bg-[var(--card-bg-color)]"
            autocomplete="off"
          />
        </template>

        <template #footer>
          <template v-if="cachedMarkerVo.isSnapshot">
            <div class="w-full text-sm grid place-content-center">
              点位快照
            </div>
          </template>

          <template v-else>
            <div class="flex justify-between p-1 gap-1">
              <GSButton
                v-if="accessStore.get('MARKER_EDIT')"
                size="small"
                theme="dark"
                :disabled="hasMapMission"
                @click="editMarker"
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
            </div>
          </template>
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

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    background-color: var(--card-bg-color);
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 5px;
    border: 2px solid var(--card-bg-color);
    cursor: default;
    background-color: #BFBBB5;
    transition: all ease 150ms;
    &:hover {
      background-color: #FFFFFF;
    }
  }
}
</style>
