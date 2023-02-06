<script lang="ts" setup>
defineProps<{
  label: string
  content?: string
}>()
</script>

<template>
  <div class="setting-item flex justify-between px-4 py-3" v-bind="$attrs">
    <div class="flex-flex col">
      <div class="text-black">
        {{ label }}
      </div>
      <div v-if="content" class="text-gray-600 text-xs">
        {{ content }}
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.setting-item {
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: #EAEAEA;
  &:first-of-type {
    border-radius: 4px 4px 0 0;
  }
  &:last-of-type {
    border-radius: 0 0 4px 4px;
    border-bottom-width: 1px;
  }
}
</style>
