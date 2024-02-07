<script lang="ts" setup>
import type { ConditionAdvancedItem } from '@/stores/types'

defineProps<{
  condition: ConditionAdvancedItem
}>()
</script>

<template>
  <div>{{ condition.id }}</div>
</template>
