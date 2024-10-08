<script setup lang="ts">
import { MarkerLink } from '../modules'
import { markerLinkContext } from '../modules/MarkerLink/core'
import BarItem from './BarItem.vue'
import { useMapStateStore } from '@/stores'
import { MapWindowTeleporter } from '@/pages/pageMapV2/components'
import { GSMarkerLinkLayer } from '@/pages/pageMapV2/core/layer'
import type { GSMapState } from '@/stores/types/genshin-map-state'

const prefix = crypto.randomUUID()
const mapStateStore = useMapStateStore()

const {
  isEnable,
  isProcessing,
} = mapStateStore.subscribeMission('markerLink', () => [])

mapStateStore.event.on('click', (info) => {
  if (isProcessing.value || !isEnable.value || !(info.sourceLayer instanceof GSMarkerLinkLayer))
    return
  const { source } = (info.object) as GSMapState.MLRenderUnit
  const marker = mapStateStore.currentMarkerIdMap.get(source)
  if (!marker)
    return
  markerLinkContext.toggleMarkerLink()
  markerLinkContext.selectSourceMarker(marker)
  markerLinkContext.cancelSelect()
})
</script>

<template>
  <BarItem
    label="点位关联"
    class="grid place-content-center place-items-center"
    divider
    :disabled="!markerLinkContext.isMissionEnable.value || markerLinkContext.loading.value"
    @click="markerLinkContext.toggleMarkerLink"
  >
    <el-icon :size="20">
      <svg class="icon" viewBox="0 0 1024 1024" :fill="markerLinkContext.isMissionProcessing.value ? '#00FF00' : 'currentColor'">
        <defs>
          <g :id="`${prefix}-a`" transform="translate(-72 -72)">
            <path d="M861.866667 164.266667c-87.466667-87.466667-230.4-89.6-320-2.133334l-68.266667 68.266667c-12.8 12.8-12.8 32 0 44.8s32 12.8 44.8 0l68.266667-68.266667c64-61.866667 166.4-61.866667 230.4 2.133334 64 64 64 168.533333 2.133333 232.533333l-117.333333 119.466667c-34.133333 34.133333-81.066667 51.2-128 49.066666-46.933333-4.266667-91.733333-27.733333-119.466667-66.133333-10.666667-14.933333-29.866667-17.066667-44.8-6.4-14.933333 10.666667-17.066667 29.866667-6.4 44.8 40.533333 53.333333 100.266667 87.466667 166.4 91.733333h17.066667c59.733333 0 119.466667-23.466667 162.133333-68.266666l117.333333-119.466667c83.2-89.6 83.2-234.666667-4.266666-322.133333z" />
            <path d="M505.6 750.933333l-66.133333 68.266667c-64 61.866667-166.4 61.866667-230.4-2.133333-64-64-64-168.533333-2.133334-232.533334l117.333334-119.466666c34.133333-34.133333 81.066667-51.2 128-49.066667 46.933333 4.266667 91.733333 27.733333 119.466666 66.133333 10.666667 14.933333 29.866667 17.066667 44.8 6.4 14.933333-10.666667 17.066667-29.866667 6.4-44.8-40.533333-53.333333-100.266667-87.466667-166.4-91.733333-66.133333-4.266667-130.133333 19.2-177.066666 66.133333l-117.333334 119.466667c-85.333333 89.6-85.333333 234.666667 2.133334 322.133333 44.8 44.8 102.4 66.133333 162.133333 66.133334 57.6 0 115.2-21.333333 160-64l66.133333-68.266667c12.8-12.8 12.8-32 0-44.8-14.933333-10.666667-34.133333-10.666667-46.933333 2.133333z" />
          </g>
          <g :id="`${prefix}-b`">
            <path d="M767.54821 543.725562c0-17.662265-14.3181-31.980365-31.980365-31.980365L287.843754 511.745197c-17.662265 0-31.980365 14.3181-31.980365 31.980365l0 0c0 17.662265 14.3181 31.980365 31.980365 31.980365l447.724091 0C753.23011 575.705927 767.54821 561.387827 767.54821 543.725562L767.54821 543.725562z" />
            <path d="M511.706311 287.88264c-17.662265 0-31.980365 14.3181-31.980365 31.980365l0 447.724091c0 17.662265 14.3181 31.980365 31.980365 31.980365l0 0c17.662265 0 31.980365-14.3181 31.980365-31.980365L543.686676 319.863005C543.686676 302.20074 529.368576 287.88264 511.706311 287.88264L511.706311 287.88264z" />
          </g>
          <mask :id="`${prefix}-c`">
            <g>
              <rect x="0" y="0" width="1024" height="1024" fill="#fff" />
              <use :href="`#${prefix}-b`" fill="#000" stroke="#000" stroke-width="20%" transform="translate(200 166)" />
            </g>
          </mask>
        </defs>
        <use :href="`#${prefix}-a`" :mask="`url(#${prefix}-c)`" />
        <use :href="`#${prefix}-b`" transform="translate(200 166)" />
      </svg>
    </el-icon>

    <MapWindowTeleporter :id="markerLinkContext.id" @close="markerLinkContext.finalize">
      <MarkerLink :context="markerLinkContext" />
    </MapWindowTeleporter>
  </BarItem>
</template>
