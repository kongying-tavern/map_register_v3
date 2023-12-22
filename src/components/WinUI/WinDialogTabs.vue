<script setup lang="ts">
const props = defineProps<{
  options: { key: string; name: string }[]
  disabled?: boolean
}>()

const activedTabKey = defineModel<string>('modelValue', {
  required: true,
})

const setTabKey = (tabKey: string) => {
  if (props.disabled)
    return
  activedTabKey.value = tabKey
}
</script>

<template>
  <div class="win-tabs">
    <div
      v-for="tab in options"
      :key="tab.key"
      class="tab-item"
      :class="{
        actived: activedTabKey === tab.key,
      }"
      @click="() => setTabKey(tab.key)"
    >
      {{ tab.name }}
    </div>
  </div>
</template>

<style scoped>
.win-tabs {
  @apply flex mx-2 text-xs translate-y-[1px];
}

.tab-item {
  @apply
    py-1 px-2 mt-0.5
    border border-[var(--el-border-color)]
    bg-[var(--el-fill-color)]
    -translate-x-[1px]
    select-none
    relative
  ;

  &:first-of-type {
    @apply translate-x-0;
  }

  &.actived {
    @apply bg-[var(--el-bg-color)] mt-0;
  }
  &.actived::before {
    content: '';
    @apply
      w-full h-[1px]
      absolute left-0 bottom-0
      bg-[var(--el-bg-color)]
      translate-y-[1px]
    ;
  }

  &:not(.actived):hover {
    @apply bg-[var(--el-bg-color)];
  }
}
</style>
