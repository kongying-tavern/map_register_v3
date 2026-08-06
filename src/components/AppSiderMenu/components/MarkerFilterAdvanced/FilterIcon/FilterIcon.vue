<script lang="ts" setup>
import type { MAFModelId } from '@/shared'
import { MAF_MODEL_META_MAP } from '@/shared'

const props = defineProps<{
  id: MAFModelId
}>()

const iconComponent = computed(() => {
  return MAF_MODEL_META_MAP[props.id].icon
})
</script>

<template>
  <component :is="iconComponent" />
</template>
