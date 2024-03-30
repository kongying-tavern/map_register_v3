<script setup lang="ts">
import { fromEvent as fromRefEvent, useSubscription } from '@vueuse/rxjs'
import type { Observable } from 'rxjs'
import { filter, fromEvent, map, switchMap, takeUntil } from 'rxjs'

const resizerRef = ref<HTMLElement>() as Ref<HTMLElement>

const pointerdown = fromRefEvent(resizerRef, 'pointerdown') as Observable<PointerEvent>
const pointermove = fromEvent<PointerEvent>(window, 'pointermove')
const pointerup = fromEvent<PointerEvent>(window, 'pointerup')

useSubscription(pointerdown.pipe(
  filter((ev) => {
    return [
      ev.button === 0,
    ].every(condition => condition)
  }),

  switchMap(() => {
    return pointermove.pipe(
      map(() => {
      }),

      takeUntil(pointerup),
    )
  }),
).subscribe())

/**
 * sx: 是否可编辑水平尺寸
 * sy: 是否可垂直水平尺寸
 * px: 是否可移动水平位置
 * py: 是否可垂直水平位置
 */
const resizeFlags = [
  { sx: true, sy: true, px: true, py: true, cursor: 'nwse-resize' }, // 左上
  { sx: false, sy: true, px: false, py: true, cursor: 'ns-resize' }, // 上
  { sx: true, sy: true, px: false, py: true, cursor: 'nesw-resize' }, // 右上
  { sx: true, sy: false, px: false, py: false, cursor: 'ew-resize' }, // 右
  { sx: true, sy: true, px: false, py: false, cursor: 'nwse-resize' }, // 右下
  { sx: false, sy: true, px: false, py: false, cursor: 'ns-resize' }, // 下
  { sx: true, sy: true, px: true, py: false, cursor: 'nesw-resize' }, // 左下
  { sx: true, sy: false, px: true, py: false, cursor: 'ew-resize' }, // 左
]
</script>

<template>
  <div ref="resizerRef" class="window-resizer">
    <div
      v-for="({ cursor, ...flag }, i) in resizeFlags"
      v-once
      :key="i"
      :class="flag"
      :style="{ cursor }"
      class="resize-controller"
    />
  </div>
</template>

<style scoped>
.window-resizer {
  --controller-size: 16px;
  --offset: -14px;
  --radius: 8px;
  --over: calc(var(--controller-size) + var(--offset));
  --rest: 4px;
  --border-width: 3px;
  --border-color: transparent;

  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  clip-path: polygon(
    50% calc(0% - var(--over)),
    calc(100% + var(--over)) calc(0% - var(--over)),
    calc(100% + var(--over)) calc(100% + var(--over)),
    calc(0% - var(--over)) calc(100% + var(--over)),
    calc(0% - var(--over)) calc(0% - var(--over)),
    50% calc(0% - var(--over)),
    50% var(--rest),
    var(--rest) var(--rest),
    var(--rest) calc(100% - var(--rest)),
    calc(100% - var(--rest)) calc(100% - var(--rest)),
    calc(100% - var(--rest)) var(--rest),
    50% var(--rest)
  );
  user-select: none;
}

.resize-controller {
  --lx: 0;
  --ly: 0;
  --tx: calc(-1 * var(--offset));
  --ty: calc(-1 * var(--offset));
  --w: calc(100% + 2 * var(--offset));
  --h: calc(100% + 2 * var(--offset));
  --rt: 0;
  --rr: 0;
  --rb: 0;
  --rl: 0;

  position: absolute;
  left: var(--lx);
  top: var(--ly);
  transform: translate(var(--tx), var(--ty));
  width: var(--w);
  height: var(--h);
  pointer-events: auto;
  z-index: 1;
  border-color: var(--border-color);
  border-width:
    calc(var(--rt) * var(--border-width))
    calc(var(--rr) * var(--border-width))
    calc(var(--rb) * var(--border-width))
    calc(var(--rl) * var(--border-width))
  ;

  &:hover {
    --border-color: #7FF5FE;
  }

  &.sx.sy {
    border-radius:
      calc(var(--rl) * var(--rt) * var(--radius))
      calc(var(--rr) * var(--rt) * var(--radius))
      calc(var(--rr) * var(--rb) * var(--radius))
      calc(var(--rl) * var(--rb) * var(--radius))
    ;
  }

  &.sx {
    --w: var(--controller-size);
    --lx: calc(100%);
    --tx: calc(var(--offset));
    --rr: 1;
  }

  &.sy {
    --h: var(--controller-size);
    --ly: calc(100%);
    --ty: calc(var(--offset));
    --rb: 1;
  }

  &.px {
    --lx: 0;
    --tx: calc(-100% - var(--offset));
    --rr: 0;
    --rl: 1;
  }

  &.py {
    --ly: 0;
    --ty: calc(-100% - var(--offset));
    --rb: 0;
    --rt: 1;
  }
}
</style>
