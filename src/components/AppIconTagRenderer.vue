<script lang="ts" setup>
import { QuestionFilled } from '@element-plus/icons-vue'

defineProps<{
  src?: string
  mapping?: [number, number]
}>()
</script>

<template>
  <div class="image-container relative">
    <QuestionFilled v-if="!src || !mapping" class="absolute w-full h-full left-0 top-0" />

    <div
      v-else
      class="image-renderer w-16 h-16 origin-top-left"
      :style="{
        'background': `url(${src})`,
        'background-position': `${-mapping[0]}px ${-mapping[1]}px`,
      }"
    />
  </div>
</template>

<style scoped>
@property --image-container-width {
  syntax: "<length>";
  initial-value: 0px;
  inherits: false;
}

@property --image-container-height {
  syntax: "<length>";
  initial-value: 0px;
  inherits: false;
}

.image-container {
  container-type: size;
}

.image-renderer {
  --image-container-width: 100cqw;
  --image-container-height: 100cqh;
  scale:
    tan(atan2(var(--image-container-width), 64px))
    tan(atan2(var(--image-container-height), 64px));
}
</style>
