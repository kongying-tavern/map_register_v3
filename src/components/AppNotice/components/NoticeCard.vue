<script setup lang="ts">
import { context } from '../context'
import NoticeTitle from './NoticeTitle.vue'
import { AppRichtextEditor, GSButton } from '@/components'
import { CloseFilled } from '@/components/GenshinUI/GSIcon'
import { useNoticeStore } from '@/stores'

const noticeStore = useNoticeStore()

const handleTitleSelect = (notice: API.NoticeVo) => {
  noticeStore.read(notice.id!)
  noticeStore.selected = notice
}
</script>

<template>
  <div class="card-body">
    <div class="card-header">
      <div class="title">
        公告
      </div>
      <div class="absolute top-1/2 right-[16px] -translate-y-1/2">
        <GSButton theme="plain" @click="context.close">
          <template #icon>
            <el-icon color="var(--icon-color)" :size="20">
              <CloseFilled />
            </el-icon>
          </template>
        </GSButton>
      </div>
    </div>

    <div class="card-content">
      <div class="sider">
        <NoticeTitle
          v-for="notice in noticeStore.noticeList"
          :key="notice.id"
          :notice="notice"
          :hidden="noticeStore.isRead(notice.id!)"
          :is-selected="noticeStore.selected?.id === notice.id"
          @click="() => handleTitleSelect(notice)"
        />
      </div>

      <div v-if="!noticeStore.selected" class="detail">
        No content
      </div>

      <div v-else class="detail">
        <div class="detail-title">
          {{ noticeStore.selected.title }}
        </div>
        <AppRichtextEditor
          class="flex-1"
          :model-value="noticeStore.selected.content"
          :base-text-size="20"
          :headers="[2, 4]"
          :view-line-height="1.5"
          :view-zoom="0.75"
          readonly
          default-foreground="#656565"
          default-background="transparent"
          view-font="MHYG, sans-serif"
          scrollbar-color="#D8D7D5"
          scrollbar-thumb-color="#FFF"
          scrollbar-width="8px"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-body {
  width: 800px;
  max-width: 100dvw;
  height: 600px;
  display: flex;
  flex-direction: column;
  transform: scale(var(--dialog-body-scale));
  transition: transform var(--dialog-body-tr-timing) var(--dialog-body-tr-duration);
}

.card-header {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #454D5C;
  color: #ECE5D8;
  outline: 2px solid #FFFFFF20;
  outline-offset: -6px;
  padding: 8px 16px;
  filter: drop-shadow(0 0 6px #00000060);
  z-index: 1;
  user-select: none;
}

.title {
  line-height: 48px;
  font-size: 20px;
  padding: 0 8px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    background: #DE7961;
  }
}

.card-content {
  background: #EBE7DF;
  flex: 1;
  flex-shrink: 0;
  display: flex;
  overflow: hidden;
}

.sider {
  width: 200px;
  height: 100%;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.detail {
  --padding: 2px;
  --line-color: #F5F0EA;

  flex: 1;
  flex-shrink: 0;
  background: #F9F6F2;
  position: relative;
  padding: 16px;
  overflow: auto;
  display: flex;
  height: 100%;
  overflow: hidden;
  flex-direction: column;

  --link-underline-color: #8cb4ff;
  --link-bg-color: #f5edd5;
  --link-bg-color-hover: #d5e0f7;
  outline: none;
  min-height: 100%;
  color: var(--el-text-color-primary);
}

.detail-title {
  font-size: 24px;
  line-height: 1.2em;
  padding-bottom: 12px;
  border-bottom: 2px solid #CBC2B040;
  margin-bottom: 16px;
  color: #656565;
}
</style>
