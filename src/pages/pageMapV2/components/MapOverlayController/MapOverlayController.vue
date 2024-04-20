<script lang="ts" setup>
import { OverlayGroup } from '.'
import { useOverlayStore, usePreferenceStore } from '@/stores'

const overlayStore = useOverlayStore()
const preferenceStore = usePreferenceStore()

const areaCode = computed(() => preferenceStore.preference['markerFilter.state.areaCode'])

watch(areaCode, () => {
  overlayStore.visibleItemIds.clear()
})

const overlayGroups = computed(() => {
  const currentAreaCode = areaCode.value

  const chunks = overlayStore.existOverlays
    .filter(chunk => chunk.areaCode === currentAreaCode)

  const groups = Map.groupBy(chunks, ({ group }) => {
    return group
  })

  return groups
})
</script>

<template>
  <div class="overlay-control-panel genshin-text">
    <OverlayGroup
      v-for="([group, chunks]) in overlayGroups"
      :key="group.id"
      :data="{ ...group, chunks }"
    />
  </div>
</template>

<style scoped>
.overlay-control-panel {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background: #ECE5D8;
  padding: 8px;
  gap: 8px;

  &::-webkit-scrollbar {
    width: 10px;
    background-color: #D9D3C8;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #4A5366;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #4A536680;
  }
}
</style>
