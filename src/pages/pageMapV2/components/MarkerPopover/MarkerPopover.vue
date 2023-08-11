<script lang="ts" setup>
import { Check, CirclePlus, DeleteFilled, Edit, Rank } from '@element-plus/icons-vue'
import { covertPosition } from '../../utils'
import { useCondition, useMap, useMarkerDrawer } from '../../hooks'
import { MapAffix, MarkerEditPanel } from '..'
import { MarkerPanel } from './components'
import { useMarkerExtra, useMarkerFinished, useSkeletonPicture } from './hooks'
import { useIconTagStore } from '@/stores'
import { CloseFilled } from '@/components/GenshinUI/GSIcon'
import { GSButton } from '@/components'
import { useGlobalDialog } from '@/hooks'

const iconTagStore = useIconTagStore()

const { cachedMarkerVo, focus, blur } = useMarkerDrawer()

const { pictureUrl, loading: imageLoading } = useSkeletonPicture(cachedMarkerVo)

const { isFinished } = useMarkerFinished(cachedMarkerVo)

const { isUnderground, hiddenFlagType, refreshTimeType } = useMarkerExtra(cachedMarkerVo)

const { map } = useMap()
const conditionManager = useCondition()
watch(() => conditionManager.layerMarkerMap[map.value?.baseLayer?.rawProps.code ?? ''], blur)

// ==================== 编辑点位 ====================
const { DialogService } = useGlobalDialog()
const openMarkerEditor = () => {
  focus.value && DialogService
    .config({
      title: `编辑点位：${focus.value.markerTitle}`,
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
        </div>
      </template>

      <template #footer>
        <GSButton size="small" theme="dark" @click="openMarkerEditor">
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

        <GSButton size="small" theme="dark" title="移动点位">
          <template #icon>
            <el-icon color="#F7BA3F">
              <Rank />
            </el-icon>
          </template>
        </GSButton>

        <GSButton size="small" theme="dark" title="删除点位">
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
