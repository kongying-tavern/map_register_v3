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
  <div class="w-full h-full overflow-hidden flex flex-col">
    <div class="overlay-control-panel genshin-text">
      <OverlayGroup
        v-for="([group, chunks]) in overlayGroups"
        :key="group.id"
        :group="{ ...group, chunks }"
      />
    </div>
  </div>
</template>

<style scoped>
.overlay-control-panel {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background: #ECE5D8;
  padding: 8px;
  gap: 8px;

  &::-webkit-scrollbar {
    width: 8px;
    background-color: #D9D3C8;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #4A5366;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #4A536680;
  }
}
</style>
