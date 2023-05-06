<script lang="ts" setup>
import { useMap } from '@/pages/pageMapV2/hooks'

interface GenshinMapAffixProps {
  view: HTMLElement | null
  zoomWithMap?: boolean
  pos?: [number, number]
  visible?: boolean
}

const props = withDefaults(defineProps<GenshinMapAffixProps>(), {
  pos: () => [0, 0],
  visible: true,
})

const viewRef = toRef(props, 'view')
const { width, height } = useElementSize(viewRef)

const { map } = useMap()

const scaleRatio = computed(() => props.zoomWithMap ? (2 ** (map.value?.mainViewState.zoom ?? 1)) : 1)

const affixVisible = computed(() => props.pos !== undefined && props.visible !== false)

/** 视口中心坐标 */
const center = computed(() => [width.value / 2, height.value / 2])

const position = computed(() => {
  if (!map.value?.baseLayer)
    return [-9999, -9999]
  const [coordOffsetX, coordOffsetY] = map.value.baseLayer.rawProps.center
  const { target, zoom } = map.value.mainViewState
  const scale = 2 ** zoom
  const [x, y] = props.pos
  const [tx, ty] = target
  const lx = (x + coordOffsetX - tx) * scale
  const ly = (y + coordOffsetY - ty) * scale
  const [cx, cy] = center.value
  return [cx + lx, cy + ly]
})
</script>

<template>
  <div
    v-show="affixVisible"
    v-bind="$attrs"
    class="gs-map-affix absolute left-0 top-0"
    :style="{
      '--sc': scaleRatio,
      '--tx': `${position[0]}px`,
      '--ty': `${position[1]}px`,
      'z-index': '1',
    }"
  >
    <slot name="default" :scale="scaleRatio" />
  </div>
</template>

<style lang="scss" scoped>
.gs-map-affix {
  transform-origin: 0 0;
  translate: var(--tx) var(--ty);
  scale: var(--sc);
  pointer-events: all;
}
</style>
