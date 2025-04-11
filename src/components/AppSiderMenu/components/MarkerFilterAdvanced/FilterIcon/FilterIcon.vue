<script lang="ts" setup>
import type { MAFModelId } from '@/shared'
import { MAF_MODEL_ICON_MAP } from '@/shared'

const props = defineProps<{
  id: MAFModelId
}>()

const iconComponent = computed(() => {
  return MAF_MODEL_ICON_MAP[props.id]
}) as ComputedRef<Component>
</script>

<template>
  <component :is="iconComponent" />
</template>
