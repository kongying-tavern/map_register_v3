<script lang="ts" setup>
import { useBanner } from '@/hooks'

const { content, height, visible, show } = useBanner()

const cssHeight = useCssVar('--gs-banner-height')
watch(visible, (isVisibile) => {
  cssHeight.value = isVisibile ? '32px' : '0px'
}, { immediate: true })

import.meta.env.VITE_ENV_BANNER && show(import.meta.env.VITE_ENV_BANNER)
</script>

<template>
  <Transition name="draw-y" mode="out-in" appear>
    <div
      v-show="visible"
      class="genshin-text absolute w-full top-0 text-md p-1 px-2 text-center"
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
