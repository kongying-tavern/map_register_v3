<script lang="ts" setup>
import { MapLocation } from '@element-plus/icons-vue'
import {
  IconApplication,
  IconDocument,
  IconDocumentRegex,
  IconEye,
  IconImage,
  IconLayers,
  IconLink,
  IconPackage,
  IconPackageList,
  IconPackageRegex,
  IconPackageTimesNumber,
  IconPound,
  IconTimer,
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
    9: IconLink,
    10: IconTimer,
    11: IconEye,
    101: MapLocation,
    102: IconApplication,
    103: IconPackage,
    104: IconPackageRegex,
    105: IconPackageList,
    106: IconPackageTimesNumber,
  }[props.id]
}) as ComputedRef<Component>
</script>

<template>
  <component :is="iconComponent" />
</template>
