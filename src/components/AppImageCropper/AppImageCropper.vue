<script setup lang="ts">
import type { AppImageCropperProps } from './types'
import { useCropper } from './hooks'

// TODO 视情况添加更多裁切功能
const props = withDefaults(defineProps<AppImageCropperProps>(), {
  image: '',
  maxZoom: 1,
  minZoom: 0,
  fit: 'cover',
  cropRatio: 1,
  allowRotate: false,
  autoCrop: false,
  autoCropDebounce: 200,
  autoCropOnImageLoaded: true,
})

const emits = defineEmits<{
  crop: [Blob]
  error: [Error]
}>()

const containerRef = ref<HTMLDivElement>()

const { crop } = useCropper({
  props: toRefs(props),
  container: containerRef,
  onCrop: blob => emits('crop', blob),
  onError: err => emits('error', err),
})

defineExpose({
  crop,
})
</script>

<template>
  <div ref="containerRef" class="image-cropper" />
</template>

<style scoped>
.image-cropper {
  --s: 32px;
  --color-a: transparent;
  --color-b: var(--el-fill-color-darker);
  background: conic-gradient(
    from 0deg at 50% 50%,
    var(--color-a) 25%,
    var(--color-b) 25%,
    var(--color-b) 50%,
    var(--color-a) 50%,
    var(--color-a) 75%,
    var(--color-b) 75%,
    var(--color-b) 100%
  );
  background-size: var(--s) var(--s);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1;
    border: 1px dashed var(--el-color-primary);
    opacity: 0.8;
    pointer-events: none;
  }
}
</style>
