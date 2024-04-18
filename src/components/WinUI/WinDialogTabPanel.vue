<script setup lang="ts">
import WinDialogTabs from './WinDialogTabs.vue'

defineProps<{
  tabs?: { key: string; name: string }[]
  tabsDisabled?: boolean
}>()

const tabKey = defineModel<string>('tabKey', {
  required: false,
  default: undefined,
})
</script>

<template>
  <WinDialogTabs
    v-if="tabs?.length"
    v-model="tabKey"
    :options="tabs"
    :disabled="tabsDisabled"
  />

  <div
    v-bind="$attrs"
    class="win-dialog-tab-panel"
    :class="[tabs ? '' : 'mt-2']"
  >
    <slot name="default" />
  </div>
</template>

<style scoped>
.win-dialog-tab-panel {
  @apply
    mx-2
    p-2 overflow-hidden rounded
    border border-[var(--el-border-color)]
    bg-[var(--el-fill-color-blank)]
  ;
}
</style>
