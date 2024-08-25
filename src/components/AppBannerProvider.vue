<script lang="ts" setup>
import { useBanner } from '@/hooks'

const { content, height, visible, show } = useBanner()

const cssHeight = useCssVar('--gs-banner-height')
watch(visible, (isVisibile) => {
  cssHeight.value = isVisibile ? '32px' : '0px'
}, { immediate: true })

const parsedContent = (import.meta.env.VITE_ENV_BANNER ?? '')
  .replace(/\{\{branch\}\}/g, window.__APP_BRANCH__)
  .replace(/\{\{commit\}\}/g, window.__APP_COMMIT_HASH__)
parsedContent && import.meta.env.VITE_ENV_BANNER_VISIBLE === 'on' && show(parsedContent)
</script>

<template>
  <Transition name="draw-y" mode="out-in" appear>
    <div
      v-show="visible"
      class="font-['HYWenHei-85W'] absolute w-full top-0 text-md p-1 px-2 text-center"
      :style="{
        height: `${height}px`,
        background: '#E2DED5',
        color: '#4A4F50',
        zIndex: 3000,
      }"
    >
      {{ content }}
    </div>
  </Transition>
</template>
