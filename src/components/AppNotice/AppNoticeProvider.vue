<script setup lang="ts">
import { context } from './context'
import { useNoticeList } from './hooks'
import { AppRichtextEditor, GSButton } from '@/components'
import { CloseFilled } from '@/components/GenshinUI/GSIcon'

withDefaults(defineProps<Partial<{
  sizeRatio: number
  baseTextSize: number
  defaultForeground: string
  defaultBackground: string
  viewFont: string
  viewZoom: number
  viewLineHeight: number
}>>(), {
  sizeRatio: 1,
  baseTextSize: 16,
  defaultForeground: '#000',
  defaultBackground: '#fff',
  viewFont: '',
  viewZoom: 1,
  viewLineHeight: 1.2,
})

const { noticeList } = useNoticeList()

const selectedIndex = ref(0)

const selectedNotice = computed(() => noticeList.value[selectedIndex.value])
</script>

<template>
  <dialog
    :ref="context.dialogRef"
    class="app-notice-provider genshin-text"
  >
    <div class="body">
      <div class="header relative">
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

      <div class="content">
        <div class="sider">
          <div
            v-for="notice, index in noticeList"
            :key="notice.id"
            class="notice-title"
            :class="{
              'is-selected': selectedIndex === index,
            }"
            @click="selectedIndex = index"
          >
            {{ notice.title }}
          </div>
        </div>

        <div v-if="!selectedNotice" class="detail">
          No content
        </div>

        <div v-else class="detail">
          <div class="detail-title">
            {{ selectedNotice.title }}
          </div>
          <AppRichtextEditor
            class="flex-1"
            :model-value="selectedNotice.content"
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
  </dialog>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.app-notice-provider {
  --opacity: 0;
  --duration: .2s;

  display: block;
  margin: auto auto;
  border-radius: 4px;
  overflow: hidden;
  z-index: 10;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.4));
  background: transparent;
  outline: none;
  opacity: var(--opacity);
  transition: all var(--duration) cubic-bezier(0.18, 0.89, 0.32, 1.28);
  transform: scale(0.8);
  pointer-events: none;

  &[open] {
    --opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  &::backdrop {
    background-color: #00000040;
    animation: fade-in var(--duration) ease;
    transition: all ease .2s;
  }
}

.body {
  width: 800px;
  max-width: 100%;
  height: 600px;
  display: flex;
  flex-direction: column;
  padding-top: 60px;
}

.header {
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
  position: absolute;
  top: 0;
  width: 100%;
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

.content {
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
}

.notice-title {
  --padding: 2px;
  --line-color: #EEE7DD;
  --arrow-opacity: 0;

  background: #F9F6F2;
  color: #737883;
  padding: 0 20px 0 12px;
  border-radius: 4px;
  position: relative;
  outline: 2px solid transparent;
  filter: drop-shadow(0 0 4px #33333340);
  cursor: pointer;
  user-select: none;
  margin: 0 0 12px;
  height: 50px;
  line-height: 50px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    outline-color: #E5BFB2;
    background: #FFFFFF;
  }

  &:active {
    --line-color: #E5D9C2;
    background: #EDE3CE;
  }

  &.is-selected {
    color: #3B4354;
    background: #FFFDFA;
    --arrow-opacity: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: var(--padding);
    left: var(--padding);
    width: calc(100% - calc(2 * var(--padding)));
    height: calc(100% - calc(2 * var(--padding)));
    border-radius: 2px;
    border: 2px solid var(--line-color);
    pointer-events: none;
  }

  &::after {
    content: '';
    opacity: var(--arrow-opacity);
    position: absolute;
    width: 10px;
    height: 10px;
    top: 50%;
    right: 12px;
    background: conic-gradient(from -135deg at 50% 50%, transparent 25%, #3B4354 25%, #3B4354 75%, transparent 75%);
    filter: drop-shadow(0 0 2px #3B435480);
    border-radius: 1px;
    transform-origin: 50% 50%;
    transform: translate(0, -50%) rotate(45deg);
    transition: all .2s ease;
  }
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
  font-size: calc(v-bind('baseTextSize') * v-bind('viewZoom') * 1px);
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
