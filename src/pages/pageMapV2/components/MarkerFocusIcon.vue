<script lang="ts" setup>
import { useMap } from '../hooks'
import { covertPosition } from '../utils'
import { MapAffix } from '.'

defineProps<{
  marker?: API.MarkerVo | null
}>()

const { map } = useMap()

const zoom = computed(() => map.value?.mainViewState.zoom ?? 0)
const scale = computed(() => 2 ** Math.min(zoom.value + 2, 0))

const ICON_SIZE = 50
const offset = computed(() => `${0.4 * ICON_SIZE * scale.value}px`)
</script>

<template>
  <MapAffix v-if="marker" :pos="covertPosition(marker.position)">
    <div
      class="genshin-active-marker"
      :style="{
        '--offset': offset,
        '--scale': `${scale * 100}%`,
      }"
    />
  </MapAffix>
</template>

<style lang="scss" scoped>
@use "sass:math" as math;

@mixin calculateClipPath($Ro: 24, $Ri: 20, $size: 56) {
  $center: math.div($size, 2);
  $Ro2: math.pow($Ro, 2);
  $Ro3: math.pow($Ro, 3);
  $Ro4: math.pow($Ro, 4);
  $Ri2: math.pow($Ri, 2);
  $Ri3: math.pow($Ri, 3);
  $Ri4: math.pow($Ri, 4);
  $Ri5: math.pow($Ri, 5);
  $Rd: math.sqrt($Ro2 - $Ri2);

  $x: math.div(8 * $Ri5 + 12 * $Ri3 * $Ro2 + 4 * $Ri4 * $Rd - $Ro4 * $Rd, 20 * $Ri4 + 4 * $Ri2 * $Ro2 + $Ro4);
  $y: math.div($Ri * (4 * $Ri4 + 8 * $Ri2 * $Ro2 + 3 * $Ro4 - 8 * $Ri3 * $Rd + 4 * $Ri * $Ro2 * $Rd) ,20 * $Ri4 + 4 * $Ri2 * $Ro2 + $Ro4);

  clip-path: path('\
    M #{$center + $Ri} #{$center}\
    A #{$Ri} #{$Ri} 0 1 0 #{$center + $Ri} #{$center + 0.01}\
    M #{$center + $x}  #{$center - $y}\
    A #{$Ro} #{$Ro} 0 0 1 #{$center+$x} #{$center + $y}\
    L #{$center + $Ri} #{$center + $Ri}\
    L #{$center + $y}  #{$center + $x}\
    A #{$Ro} #{$Ro} 0 0 1 #{$center - $y} #{$center + $x}\
    L #{$center - $Ri} #{$center + $Ri}\
    L #{$center - $x}  #{$center + $y}\
    A #{$Ro} #{$Ro} 0 0 1 #{$center - $x} #{$center - $y}\
    L #{$center - $Ri} #{$center - $Ri}\
    L #{$center - $y}  #{$center - $x}\
    A #{$Ro} #{$Ro} 0 0 1 #{$center + $y} #{$center - $x}\
    L #{$center + $Ri} #{$center - $Ri}\
    L #{$center + $x}  #{$center - $y}\
    Z'
  );
}

@keyframes scaleFadeIn {
  0% {
    scale: 1;
    opacity: 0.8;
  }
  50% {
    scale: 0.9;
    opacity: 1;
  }
  100% {
    scale: 1;
    opacity: 0.8;
  }
}

// 点位激活时的光标效果
.genshin-active-marker {
  $size: 50;

  width: #{$size}px;
  height: #{$size}px;
  translate: -50% calc(-50% - var(--offset));
  pointer-events: none;
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 1));

  &::before {
    content: '';
    background: #FFF;
    width: 100%;
    height: 100%;
    position: absolute;
    animation: scaleFadeIn forwards;
    animation-duration: 100ms;
    @include calculateClipPath(25, 21, $size);
  }
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: #FFF;
    clip-path: circle(2px);
  }
}
</style>
