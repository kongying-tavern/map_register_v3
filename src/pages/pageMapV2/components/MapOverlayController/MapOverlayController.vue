<script lang="ts" setup>
import OverlayArea from './OverlayArea.vue'
import OverlayGroup from './OverlayGroup.vue'
import { useOverlayStore, usePreferenceStore } from '@/stores'

const overlayStore = useOverlayStore()
const preferenceStore = usePreferenceStore()

const areaCode = computed(() => preferenceStore.preference['markerFilter.state.areaCode'])

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
  <div class="overlay-control-panel font-['HYWenHei-85W'] w-full h-full overflow-hidden flex flex-col">
    <OverlayArea />

    <div class="overlay-scrollbar overflow-auto flex-1 flex flex-col p-2 gap-2">
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
  background: #ECE5D8
}

.overlay-scrollbar {
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
