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
    :class="[tabs ? 'rounded rounded-t-none' : 'mt-2 rounded']"
  >
    <slot name="default" />
  </div>
</template>

<style scoped>
.win-dialog-tab-panel {
  @apply
    mx-2
    p-2 overflow-hidden
    border border-[var(--el-border-color)]
    bg-[var(--el-fill-color-blank)]
  ;
}
</style>
