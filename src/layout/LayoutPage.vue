<template>
  <div class="layout-page" v-bind="$attrs">
    <div class="layout-page__header">
      <slot name="header" />
    </div>

    <div class="layout-page__main">
      <slot name="default" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-page {
  padding: 1em;
  display: flex;
  gap: 0.5em;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease, background-color 0.2s;

  .layout-page__main {
    flex: 1;
    overflow: auto;
  }
}
</style>
