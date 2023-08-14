<script lang="ts" setup>
import type { Observable } from 'rxjs'
import { filter, fromEvent as fromStaticEvent, map, switchMap, takeUntil } from 'rxjs'
import { fromEvent, useSubscription } from '@vueuse/rxjs'
import { clamp } from 'lodash'
import { ElMessage } from 'element-plus'
import { messageFrom } from '@/utils'

const props = withDefaults(defineProps<{
  modelValue?: Blob
  maxZoom?: number
}>(), {
  maxZoom: 1,
})

const emits = defineEmits<{
  'update:modelValue': [img?: ImageBitmap]
  'cutImage': [img: Blob]
  'cancel': []
}>()

// ==================== 引用 ====================
const controllerRef = ref() as Ref<HTMLElement>

const wheel = fromEvent(controllerRef, 'wheel') as Observable<WheelEvent>
const pointerdown = fromEvent(controllerRef, 'pointerdown') as Observable<PointerEvent>
const pointermove = fromStaticEvent<PointerEvent>(window, 'pointermove')
const pointerup = fromStaticEvent<PointerEvent>(window, 'pointerup')

// ==================== 原图 ====================
const rawBlob = computed(() => props.modelValue ? props.modelValue : undefined)
const rawImageUrl = useObjectUrl(rawBlob)
const rawImage = asyncComputed(() => props.modelValue ? createImageBitmap(props.modelValue) : null, null)

// ==================== 状态 ====================
const minZoom = ref(0)
const modelZoom = ref(1)

const width = computed(() => rawImage.value ? rawImage.value.width : 0)
const height = computed(() => rawImage.value ? rawImage.value.height : 0)
const zoomWidth = computed(() => width.value * modelZoom.value)
const zoomHeight = computed(() => height.value * modelZoom.value)

const minOffsetX = computed(() => (width.value - zoomWidth.value) / 2)
const maxOffsetX = computed(() => minOffsetX.value + zoomWidth.value - 400)
const minOffsetY = computed(() => (height.value - zoomHeight.value) / 2)
const maxOffsetY = computed(() => minOffsetY.value + zoomHeight.value - 400)

const modelOffsetX = ref(0)
const modelOffsetY = ref(0)

/** 将图片限制为贴边 */
const limitOffset = ({ ox = modelOffsetX.value, oy = modelOffsetY.value } = {}) => {
  modelOffsetX.value = clamp(ox, -maxOffsetX.value, -minOffsetX.value)
  modelOffsetY.value = clamp(oy, -maxOffsetY.value, -minOffsetY.value)
}

// ==================== 平移 ====================
useSubscription(pointerdown.pipe(
  filter(() => Boolean(rawImage.value)),
  switchMap((ev) => {
    ev.preventDefault()
    const { x: startX, y: startY } = ev
    const startOffsetX = modelOffsetX.value
    const startOffsetY = modelOffsetY.value
    return pointermove.pipe(
      takeUntil(pointerup),
      map(({ x: moveX, y: moveY }) => [startOffsetX + moveX - startX, startOffsetY + moveY - startY]),
    )
  }),
).subscribe(([ox, oy]) => limitOffset({ ox, oy })))

// ==================== 缩放 ====================
useSubscription(wheel.pipe(
  map((ev) => {
    ev.stopImmediatePropagation()
    ev.preventDefault()
    return ev.deltaY
  }),
).subscribe((deltaY) => {
  const expectZoom = modelZoom.value * deltaY < 0 ? 1.1 : (1 / 1.1)
  modelZoom.value = clamp(modelZoom.value * expectZoom, minZoom.value, props.maxZoom)
  limitOffset()
}))

// ==================== 初始化 ====================
const initState = () => {
  if (!rawImage.value)
    return
  const { width, height } = rawImage.value
  const minSize = Math.min(width, height)
  const initZoom = 400 / minSize
  minZoom.value = initZoom
  modelZoom.value = initZoom
  modelOffsetX.value = -(minOffsetX.value + maxOffsetX.value) / 2
  modelOffsetY.value = -(minOffsetY.value + maxOffsetY.value) / 2
}
watch(() => rawImage.value, initState)

const handleCancelEdit = () => {
  emits('update:modelValue')
  emits('cancel')
}

const cutImage = async () => {
  try {
    if (!rawImage.value)
      return
    const canvas = new OffscreenCanvas(64, 64)
    const ctx = canvas.getContext('2d')!
    const sx = (-modelOffsetX.value - minOffsetX.value) / modelZoom.value
    const sy = (-modelOffsetY.value - minOffsetY.value) / modelZoom.value
    const ss = 400 / modelZoom.value
    ctx.drawImage(rawImage.value, sx, sy, ss, ss, 0, 0, 64, 64)
    const img = await canvas.convertToBlob({
      type: 'image/png',
    })
    emits('cutImage', img)
    emits('update:modelValue')
  }
  catch (err) {
    ElMessage.error({
      message: messageFrom(err),
      offset: 48,
    })
  }
}
</script>

<template>
  <Teleport v-if="modelValue" to="body">
    <div class="image-editor">
      <div class="image-editor--body">
        <div class="image-editor--header">
          裁剪图片
        </div>

        <div class="image-editor--preview">
          <div
            ref="controllerRef"
            :style="{
              width: `${width}px`,
              height: `${height}px`,
              translate: `${modelOffsetX}px ${modelOffsetY}px`,
            }"
          >
            <img
              :src="rawImageUrl"
              :style="{
                scale: modelZoom,
              }"
            >
          </div>
        </div>

        <div class="image-editor--footer">
          <el-button type="primary" @click="cutImage">
            保存
          </el-button>
          <el-button @click="handleCancelEdit">
            取消
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.image-editor {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: #22222280;
  z-index: 4000;
  display: grid;
  place-items: center;
}

.image-editor--body {
  width: 400px;
  background: #FFF;
  border-radius: 8px;
  filter: drop-shadow(0 0 4px #333);
  display: flex;
  flex-direction: column;
}

.image-editor--header {
  padding: 8px;
  text-align: center;
}

.image-editor--preview {
  height: 400px;
  background: #444;
  overflow: hidden;
  position: relative;
  div {
    position: absolute;
    left: 0;
    top: 0;
  }
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
    outline: 2px dashed #333;
    outline-offset: -2px;
    z-index: 1;
  }
}

.image-editor--footer {
  padding: 20px;
  text-align: end;
}
</style>
