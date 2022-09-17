<template>
  <div class="breadcrumb_nav">
    <q-breadcrumbs>
      <template #separator>
        <q-icon size="1.5em" name="chevron_right" color="primary"></q-icon>
      </template>

      <q-breadcrumbs-el
        v-for="item in route.matched"
        :key="item.path"
        :to="item.path"
        :icon="item.meta.icon"
        :label="item.meta.title"
        class="breadcrumb_item"
      />
    </q-breadcrumbs>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style lang="scss" scoped>
// TODO: 变量抽离
.breadcrumb_nav {
  padding: 0 0.5em;
  display: flex;

  .breadcrumb_item {
    padding: 0.2em 0.4em;
    transition: background-color 0.2s ease;
    border-radius: 4px;
  }
  .breadcrumb_item:hover {
    background-color: rgba(46, 51, 56, 0.09);
  }
}
</style>
