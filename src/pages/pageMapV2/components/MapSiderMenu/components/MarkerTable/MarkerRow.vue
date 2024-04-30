<script lang="ts" setup>
const props = defineProps<{
  data: API.MarkerVo
}>()
</script>

<template>
  <div class="marker-table-item">
    {{ props.data.markerTitle }}
  </div>
</template>

<style scoped>
.marker-table-item {
  height: 100%;
  overflow: hidden;

  display: flex;
  align-items: center;
  background: #F4EFE280;
  clip-path: inset(0 4px 4px 4px round 0px);
  margin-right: 8px;

  padding: 0 12px 4px 12px;
}
</style>
