<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { useAreaList, useItemList, useLayer, useMap } from './hooks'
import { AppUserAvatar } from '@/components'

const containerRef = ref<HTMLElement | null>(null)

const { map, onMapCreated } = useMap(containerRef)
const { layers, activeName, layerOptions, selectLayer } = useLayer(map)

onMapCreated(() => {
  selectLayer(Object.keys(layers.value)[0])
})

const { areaId, areaTree } = useAreaList()

const { loading: itemListLoading, updateItemList } = useItemList({
  params: () => ({
    areaIdList: areaId.value !== undefined ? [areaId.value] : [],
    size: 1000,
  }),
  onSuccess: data => console.log('[updateItemList]', data.record),
})
</script>

<template>
  <div class="w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <div class="custom-control-panel absolute left-2 top-2 bg-slate-600 rounded flex flex-col p-2 gap-2">
      <el-select-v2
        v-model="activeName"
        :options="layerOptions"
        filterable
      />
      <el-tree-select
        v-model="areaId"
        :data="areaTree"
        :props="{ label: 'name', value: 'areaId' }"
        placeholder="地区"
        filterable
        clearable
        collapse-tags
        collapse-tags-tooltip
      />
      <el-button :loading="itemListLoading" @click="updateItemList">
        请求物品列表
      </el-button>
    </div>

    <div class="custom-control-panel absolute right-2 top-2 bg-slate-600 rounded">
      <AppUserAvatar map-mode />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-control-panel {
  z-index: 1000;
}
</style>
