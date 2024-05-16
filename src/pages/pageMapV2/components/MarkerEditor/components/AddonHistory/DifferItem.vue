<script setup lang="ts">
withDefaults(defineProps<{
  newData?: API.MarkerItemLinkVo[]
  oldData?: API.MarkerItemLinkVo[]
}>(), {
  newData: () => [],
  oldData: () => [],
})
</script>

<template>
  <div>
    {{ oldData }} → {{ newData }}
  </div>
</template>
