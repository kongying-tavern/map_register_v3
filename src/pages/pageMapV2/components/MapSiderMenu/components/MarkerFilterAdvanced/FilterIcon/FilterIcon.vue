<script lang="ts" setup>
import {
  IconDocument,
  IconDocumentRegex,
  IconPound,
  IconTitleSerif,
} from '@/components/AppIcons'

const props = defineProps<{
  id: number
}>()

const iconComponent = computed(() => {
  return {
    1: IconPound,
    2: IconTitleSerif,
    3: IconDocument,
    4: IconDocumentRegex,
  }[props.id]
}) as ComputedRef<Component>
</script>

<template>
  <component :is="iconComponent" />
</template>
