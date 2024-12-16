<script setup lang="ts">
import type { ModifyLinkOptions } from '../shared'
import LinkGroupItem from './LinkGroupItem.vue'

defineProps<{
  title: string
  hoverLink: string
  groups?: Map<string, Map<string, ModifyLinkOptions>>
  tempGroups?: Map<string, Map<string, ModifyLinkOptions>>
  appendGroup?: Map<string, ModifyLinkOptions>
}>()

defineEmits<{
  delete: [linkKey: string, options: ModifyLinkOptions]
  extract: [linkKey: string, options: ModifyLinkOptions]
  revest: [linkKey: string, options: ModifyLinkOptions]
}>()
</script>

<template>
  <div class="w-full h-full overflow-hidden flex flex-col">
    <div
      class="
        shrink-0 rounded mx-2
        text-center text-[var(--el-text-color-primary)]
        border border-[var(--el-border-color)]
      "
    >
      {{ title }}
    </div>

    <div class="flex-1 overflow-x-hidden overflow-y-auto px-2">
      <slot name="prepend" />

      <LinkGroupItem
        v-for="[groupId, group] in tempGroups"
        :key="groupId"
        :group="group"
        :hover="hoverLink"
        :group-id="groupId"
        is-temp
      />

      <LinkGroupItem
        v-for="[groupId, group] in groups"
        :key="groupId"
        :group="group"
        :hover="hoverLink"
        :group-id="groupId"
      />

      <LinkGroupItem
        v-if="appendGroup"
        :group="appendGroup"
        :hover="hoverLink"
        group-id=""
        group-title="未提交组"
        editable
        @delete="(...args) => $emit('delete', ...args)"
        @extract="(...args) => $emit('extract', ...args)"
        @revest="(...args) => $emit('revest', ...args)"
      />

      <slot name="append" />
    </div>
  </div>
</template>
