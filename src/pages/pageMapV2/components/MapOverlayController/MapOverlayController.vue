<script lang="ts" setup>
import { MapAffix } from '..'
import { OverlayGroup } from '.'
import { useMapSettingStore, useMapStore, useOverlayStore } from '@/stores'

const overlayStore = useOverlayStore()
const mapStore = useMapStore()
const mapSettingStore = useMapSettingStore()

whenever(() => mapSettingStore.showOverlay, overlayStore.initTopOverlays)

watch(() => mapStore.currentLayerCode, () => overlayStore.initTopOverlays(true))
</script>

<template>
  <template v-if="mapSettingStore.showOverlayController && mapSettingStore.showOverlay">
    <MapAffix
      v-for="(overlayGroup, key) in overlayStore.overlayControlGroups"
      :key="key"
      :pos="overlayGroup.bounds[0]"
      zoom-with-map
    >
      <OverlayGroup :data="overlayGroup" />
    </MapAffix>
  </template>
</template>
