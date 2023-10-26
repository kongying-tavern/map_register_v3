<script setup lang="ts">
import Konva from 'konva'
import { useImage, useStage } from './hooks'

// TODO 视情况添加更多裁切功能
const props = withDefaults(defineProps<{
  url?: string
  maxZoom?: number
  minZoom?: number
  cropRatio?: number
}>(), {
  cropRatio: 1,
})

const containerRef = ref() as Ref<HTMLDivElement>

const { stage, width, height } = useStage(containerRef)

const layer = shallowRef<Konva.Layer | null>(null)

const { startWatchUrl } = useImage(computed(() => props.url), {
  layer,
  width,
  height,
  maxZoom: computed(() => props.maxZoom),
  minZoom: computed(() => props.minZoom),
})

onMounted(async () => {
  const _stage = new Konva.Stage({
    container: containerRef.value,
  })
  const _layer = new Konva.Layer()
  _stage.add(_layer)

  stage.value = _stage
  layer.value = _layer

  startWatchUrl()
})

onBeforeUnmount(() => {
  stage.value?.destroy()
})

const crop = async () => stage.value!.toBlob({
  mimeType: 'image/png',
  pixelRatio: props.cropRatio,
}) as Promise<Blob>

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
