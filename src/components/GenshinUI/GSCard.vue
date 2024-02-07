<script lang="ts" setup>
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="gs-card-dark flex flex-col" v-bind="$attrs">
    <slot name="header">
      <div v-if="title || $slots.title" class="gs-card-title genshin-text text-center">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
    </slot>

    <slot name="default" />
  </div>
</template>

<style lang="scss" scoped>
.gs-card-dark {
  background: paint(dark-card-border);
  padding: 36px;
}

.gs-card-title {
  color: #D3BC8E;
  font-size: 30px;
}
</style>
