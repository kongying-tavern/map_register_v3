<script lang="ts" setup>
const props = defineProps<{
  actived: boolean
  row: API.ItemVo
  itemCountMap: Record<number, number>
  itemTotalMap: Record<number, number>
}>()

const calculateFinishPercentage = (row: API.ItemVo) => {
  return 100 * (props.itemCountMap[row.id as number] / props.itemTotalMap[row.id as number] || 0)
}
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-hidden" :title="row.name">
    <div class="w-full flex-1 flex flex-col px-2 justify-center">
      <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ row.name }}</span>
      <span
        class="text-xs leading-none"
        :style="{
          color: actived ? 'var(--el-color-primary-dark-2)' : '#a19c93',
        }"
      >
        {{ itemCountMap[row.id as number] ?? 0 }} / {{ itemTotalMap[row.id as number] ?? 0 }}
      </span>
    </div>
    <div
      class="collection-progress"
      :class="{
        'is-finished': calculateFinishPercentage(row) === 100,
      }"
      :style="{
        '--finish-bg': actived ? '#85ce61' : '#529b2e',
        '--progress-bg': actived ? '#66b1ff' : '#337ecc',
        '--unprogress-bg': `color-mix(in srgb, #000 ${actived ? '40%' : '60%'}, #FFF)`,
        '--percentage': `${calculateFinishPercentage(row)}%`,
      }"
    />
  </div>
</template>

<style lang="scss" scoped>
@property --percentage {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.collection-progress {
  width: 100%;
  height: 6px;
  background: linear-gradient(to right, var(--progress-bg) var(--percentage), var(--unprogress-bg) var(--percentage));
  &.is-finished {
    background: var(--finish-bg);
  }
  transition: all ease 150ms, --percentage ease 150ms;
}
</style>
