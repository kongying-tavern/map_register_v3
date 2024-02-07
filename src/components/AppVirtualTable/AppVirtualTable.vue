<script setup lang="ts" generic="T">
/**
 * @todo 当前实现只支持固定尺寸项
 * @todo grid 模式下效果不是很好，需要优化
 */
const props = withDefaults(defineProps<{
  data: T[]
  itemHeight?: number
  itemWidth?: number
  itemGap?: [number, number]
  cachedRows?: number
}>(), {
  data: () => [],
  itemHeight: 32,
  itemWidth: 0,
  itemGap: () => [0, 0],
  cachedRows: 1,
})

const tableRef = ref<HTMLElement>()

const { width, height } = useElementSize(tableRef)

const { y: scrollHeight } = useScroll(tableRef, {
  behavior: 'smooth',
  eventListenerOptions: {
    passive: true,
  },
})

const gridColumns = computed(() => {
  if (props.itemWidth <= 0)
    return 0
  const [gapWidth] = props.itemGap
  return Math.floor((width.value + gapWidth) / (props.itemWidth + gapWidth))
})

const virtualRows = computed(() => {
  const [_, gapHeight] = props.itemGap
  return Math.ceil((height.value + gapHeight) / (props.itemHeight + gapHeight)) + props.cachedRows
})

const virtualHeight = computed(() => {
  return (props.itemHeight + props.itemGap[1]) * virtualRows.value
})

const realHeight = computed(() => {
  if (gridColumns.value <= 0)
    return props.data.length * props.itemHeight
  return Math.ceil(props.data.length / gridColumns.value) * (props.itemHeight + props.itemGap[1]) - props.itemGap[1]
})

const rowIndexList = computed(() => {
  const list: number[] = []
  for (let row = 1; row <= virtualRows.value; row++)
    list[row] = row + Math.ceil(Math.max(0, scrollHeight.value - row * props.itemHeight) / virtualHeight.value) * virtualRows.value - 1
  return list
})
</script>

<template>
  <div
    ref="tableRef"
    class="app-virtual-table"
    :style="{
      '--virtual-height': virtualHeight,
      '--real-height': realHeight,
      '--scroll-height': scrollHeight,
      '--grid-columns': gridColumns,
      '--grid-rows': virtualRows,
      '--item-height': itemHeight,
      '--item-width': itemWidth,
      '--item-count': data.length,
      '--gap-x': itemGap[0],
      '--gap-y': itemGap[1],
    }"
  >
    <div v-if="gridColumns > 0" class="virtual-scroll-wrapper is-grid">
      <template v-for="rowIndex in virtualRows">
        <div
          v-for="colIndex in gridColumns"
          :key="`${rowIndex}-${colIndex}`"
          :style="{
            '--row': rowIndex,
          }"
          class="virtual-item"
        >
          <template v-if="(rowIndexList[rowIndex] * gridColumns + colIndex) <= data.length">
            <slot name="default" :index="rowIndexList[rowIndex] * gridColumns + colIndex" :item="data[rowIndexList[rowIndex] * gridColumns + colIndex - 1]" />
          </template>
        </div>
      </template>
    </div>

    <div v-else class="virtual-scroll-wrapper">
      <div
        v-for="i in virtualRows"
        :key="i"
        :style="{
          '--row': i,
        }"
        class="virtual-item"
      >
        <template v-if="rowIndexList[i] < data.length">
          <slot name="default" :index="rowIndexList[i]" :item="data[rowIndexList[i]]" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-virtual-table {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.virtual-scroll-wrapper {
  height: calc(var(--real-height) * 1px);
  overflow: hidden;

  &.is-grid {
    display: grid;
    gap: calc(var(--gap-x) * 1px) calc(var(--gap-y) * 1px);
    grid-template-columns: repeat(var(--grid-columns), calc(var(--item-width) * 1px));
    grid-template-rows: repeat(var(--grid-rows), calc(var(--item-height) * 1px));
  }
}

.virtual-item {
  --offset: calc(round(up, max(0, var(--scroll-height) - var(--row) * var(--item-height)), var(--virtual-height)));

  height: calc(var(--item-height) * 1px);
  transform: translate(0, calc(var(--offset) * 1px));
}
</style>
