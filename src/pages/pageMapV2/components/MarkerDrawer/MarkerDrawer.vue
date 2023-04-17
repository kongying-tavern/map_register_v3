<script lang="ts" setup>
import { useMap } from '@/pages/pageMapV2/hooks'

const { map } = useMap()

const blurMarker = () => {
  if (!map.value)
    return
  map.value.focus = null
  map.value.active = null
  map.value.hover = null
}
</script>

<template>
  <el-drawer
    :model-value="Boolean(map?.focus)"
    :show-close="false"
    :with-header="false"
    class="marker-info-drawer"
    append-to-body
    @close="blurMarker"
  >
    {{ map?.focus }}
  </el-drawer>
</template>
