<script lang="ts" setup>
import { useMapProjection } from '@/pages/pageMapV2/hooks'

interface GenshinMapAffixProps {
  zoomWithMap?: boolean
  pos?: [number, number]
  visible?: boolean
  pickable?: boolean
  noCovertCoord?: boolean
}

const props = withDefaults(defineProps<GenshinMapAffixProps>(), {
  pos: () => [0, 0],
  visible: true,
})

const coord = toRef(props, 'pos')
const { scaleRatio, position } = useMapProjection(coord, {
  floor: !props.zoomWithMap,
  noCovertCoord: props.noCovertCoord,
})

/** 如果选择随地图缩放，则使用缩放比例，否则不变 */
const switchScaleRatio = computed(() => props.zoomWithMap ? scaleRatio.value : 1)

const affixVisible = computed(() => props.pos !== undefined && props.visible !== false)

const mapaffixRef = ref<HTMLElement | null>(null)
useEventListener(mapaffixRef, 'contextmenu', ev => ev.preventDefault())
</script>

<template>
  <div
    v-if="affixVisible"
    ref="mapaffixRef"
    v-bind="$attrs"
    class="gs-map-affix absolute left-0 top-0"
    :class="{
      'pointer-events-auto': pickable,
    }"
    :style="{
      '--sc': switchScaleRatio,
      '--tx': `${position[0]}px`,
      '--ty': `${position[1]}px`,
      'z-index': '1',
    }"
  >
    <slot name="default" :scale="switchScaleRatio" />
  </div>
</template>

<style lang="scss" scoped>
.gs-map-affix {
  transform-origin: 0 0;
  translate: var(--tx) var(--ty);
  scale: var(--sc);
}
</style>
