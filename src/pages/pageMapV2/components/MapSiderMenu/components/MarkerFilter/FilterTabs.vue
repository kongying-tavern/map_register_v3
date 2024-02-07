<script lang="ts" setup>
defineProps<{
  tabNames: string[]
  modelValue: number
}>()

defineEmits<{
  (e: 'update:modelValue', v: number): void
}>()
</script>

<template>
  <div class="filter-tabs genshin-text">
    <div
      v-for="(key, index) in tabNames"
      :key="key"
      class="filter-tab"
      :class="{ actived: modelValue === index }"
      @click="$emit('update:modelValue', index)"
    >
      <div class="w-full whitespace-nowrap text-ellipsis overflow-hidden">
        {{ key }}
      </div>
      <div class="w-full whitespace-nowrap text-ellipsis overflow-hidden text-sm">
        <slot :name="`key-${index}`" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-tabs {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #263240;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 4px;
    background: rgb(100 100 100 / 0.6);
  }

  .filter-tab {
    --icon-scale: 1;
    --bg-color: transparent;
    --underline-scale: 0;

    flex: 1;
    padding: 8px 0 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all ease 150ms;
    user-select: none;
    position: relative;
    color: #D3BC8E;
    text-align: center;
    background: linear-gradient(to bottom, var(--bg-color) calc(100% - 4px), transparent calc(100% - 4px));
    overflow: hidden;
    cursor: pointer;

    &:not(.actived):hover {
      filter: brightness(110%);
    }
    &:not(.actived):active {
      filter: brightness(90%);
    }
    &.actived {
      --underline-scale: 1;
      --bg-color: #ECE5D8;
      color: #000;
    }
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 4px;
      left: 0;
      bottom: 0;
      background: #D3BC8E;
      transition: all ease 150ms;
      scale: var(--underline-scale) 1;
    }
  }
}
</style>
