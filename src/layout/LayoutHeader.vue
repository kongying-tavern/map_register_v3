<template>
  <div class="layout-header" v-bind="$attrs">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.layout-header {
  display: flex;
  height: var(--c-header-height);
  line-height: var(--c-header-height);
  justify-content: space-between;
  background-color: var(--el-bg-color);
  box-shadow: var(--c-header-shdow);
  transition: background-color 0.2s;
}
</style>
