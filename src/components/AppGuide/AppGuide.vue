<script setup lang="ts">
import { GuideBorder } from './components'

defineProps<{
  title?: string
  content?: string
}>()
</script>

<template>
  <div class="app-guide">
    <div class="app-guide-header">
      关闭
    </div>

    <div v-if="title || $slots.title" class="app-guide-title">
      <slot name="title">
        {{ title }}
      </slot>
    </div>

    <div v-if="$slots.default" class="app-guide-zone">
      <GuideBorder />
      <slot name="default" />
    </div>

    <div v-if="content || $slots.content" class="app-guide-text">
      <slot name="content">
        {{ content }}
      </slot>
    </div>
  </div>
</template>

<style scoped>
@keyframes guide-anime-in {
  from {
    background-color: transparent;
    backdrop-filter: blur(0px);
  }
  to {
    background-color: #00000060;
    backdrop-filter: blur(8px);
  }
}

@keyframes guide-zone-anime-in {
  from {
    transform: scale(0.98);
  }
  to {
    transform: scale(1);
  }
}

.app-guide {
  @apply
    fixed w-full h-full left-0 top-0 overflow-hidden
    grid place-content-center place-items-center
    z-50
  ;
  animation: guide-anime-in ease-out 300ms forwards;
}

.app-guide-header {
  @apply absolute w-full h-[90px] left-0 top-0 bg-[#00000060];
}

.app-guide-title {
  @apply
    mb-5 px-6
    text-3xl text-[#D3BC8E] font-[HYWenHei-85W]
  ;
}

.app-guide-zone {
  @apply
    w-[80dvw] aspect-video
    relative origin-center
  ;
  padding: 0.8% 0.75%;
  animation: guide-zone-anime-in ease-out 150ms forwards;

  @media (min-width: 960px) {
    width: 768px;
  }
}

.app-guide-text {
  @apply
    mt-5 px-6
    text-xl text-[#ECE5D8] font-[HYWenHei-85W]
  ;
}
</style>
