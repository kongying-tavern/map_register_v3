<script lang="ts" setup>
import { useBanner } from '@/hooks'

const { content, visible, show } = useBanner()

const parsedContent = (import.meta.env.VITE_ENV_BANNER ?? '')
  .replace(/\{\{branch\}\}/g, import.meta.env.VITE_COMMIT_BRANCH)
  .replace(/\{\{commit\}\}/g, import.meta.env.VITE_COMMIT_REV_HASH)
parsedContent && import.meta.env.VITE_ENV_BANNER_VISIBLE === 'on' && show(parsedContent)
</script>

<template>
  <Transition name="draw-y" mode="out-in" appear>
    <div
      v-show="visible"
      class="
        font-[HYWenHei-85W] fixed w-full h-8 top-0 text-md p-1 px-2 text-center
        bg-[#E2DED5]
        text-[#4A4F50]
        z-[3000]
      "
    >
      {{ content }}
    </div>
  </Transition>
</template>
