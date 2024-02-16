<script lang="ts" setup>
import {
  IconDocument,
  IconDocumentRegex,
  IconImage,
  IconLayers,
  IconPound,
  IconTitleSerif,
  IconVideoPlay,
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
    5: IconLayers,
    7: IconImage,
    8: IconVideoPlay,
  }[props.id]
}) as ComputedRef<Component>
</script>

<template>
  <component :is="iconComponent" />
</template>
