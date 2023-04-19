<script lang="ts" setup>
import { useMap } from '@/pages/pageMapV2/hooks'

const { map } = useMap()

const isMarkerVo = (v: unknown): v is API.MarkerVo => {
  return v !== null && typeof v === 'object' && 'markerTitle' in v
}

const marker = computed(() => {
  if (!map.value || !isMarkerVo(map.value.focus))
    return
  return map.value.focus
})

const blurMarker = () => {
  if (!map.value)
    return
  map.value.focus = null
  map.value.active = null
  map.value.hover = null
}

const { width } = useWindowSize()
</script>

<template>
  <el-drawer
    :model-value="Boolean(marker)"
    :title="`点位：${marker?.markerTitle}`"
    class="marker-info-drawer"
    append-to-body
    :size="width < 400 ? width : 400"
    @close="blurMarker"
  >
    {{ marker }}
  </el-drawer>
</template>

<style lang="scss">
.el-drawer.marker-info-drawer {
  transition: all ease 150ms;
  .el-drawer__body {
    padding: 0;
  }
}
</style>
