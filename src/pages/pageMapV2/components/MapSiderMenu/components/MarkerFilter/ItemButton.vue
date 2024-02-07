<script lang="ts" setup>
const props = defineProps<{
  actived: boolean
  row: API.ItemVo
  itemCountMap: Record<number, number>
  itemTotalMap: Record<number, number>
}>()

const finishedNum = computed(() => props.itemCountMap[props.row.id!] ?? 0)
const totalNum = computed(() => props.itemTotalMap[props.row.id!] ?? 0)
const percentage = computed(() => 100 * finishedNum.value / totalNum.value || 0)
</script>

<template>
  <div
    class="item-button w-full h-full flex flex-col overflow-hidden"
    :class="{
      'is-actived': actived,
      'is-finished': percentage === 100,
    }"
    :style="{
      '--percentage': `${percentage}%`,
    }"
    :title="row.name"
  >
    <div class="w-full flex-1 flex flex-col px-2 justify-center">
      <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ row.name }}</span>
      <span class="collection-text text-xs leading-none">
        {{ finishedNum }} / {{ totalNum }}
      </span>
    </div>
    <div class="collection-progress" />
  </div>
</template>

<style lang="scss" scoped>
@property --percentage {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.item-button {
  --color-finished: #529b2e;
  --color-progress: #337ecc;
  --color-unprogress: color-mix(in srgb, #000 60%, #FFF);
  --text-color: #A19C93;
  --progress-bg: linear-gradient(to right, var(--color-progress) var(--percentage), var(--color-unprogress) var(--percentage));

  transition: --percentage ease 150ms;

  &.is-actived {
    --color-finished: #85ce61;
    --color-progress: #66b1ff;
    --color-unprogress: color-mix(in srgb, #000 40%, #FFF);
  }

  &.is-finished {
    --progress-bg: var(--color-finished);
    --text-color: var(--color-finished);
  }
}

.collection-progress {
  width: 100%;
  height: 6px;
  background: var(--progress-bg);
}

.collection-text {
  color: var(--text-color);
}
</style>
