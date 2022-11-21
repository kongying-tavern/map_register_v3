<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { CtrlItemGroup } from './components'
import { useAreaList, useItemList, useLayer, useMap, useTypeList } from './hooks'
import { AppUserAvatar } from '@/components'

const containerRef = ref<HTMLElement | null>(null)

const { map, onMapCreated } = useMap(containerRef)
const { layers, activeName, layerOptions, selectLayer } = useLayer(map)

onMapCreated(() => {
  selectLayer(Object.keys(layers.value)[0])
})

const { areaId, areaTree } = useAreaList()
const { typeId, typeTree } = useTypeList({
  onSuccess: res => console.log('[type list]', res.data?.record),
})

const { itemList } = useItemList({
  params: () => ({
    areaIdList: !Number.isInteger(areaId.value) || !areaId.value ? [] : [areaId.value],
    typeIdList: !Number.isInteger(typeId.value) || !typeId.value ? [] : [typeId.value],
    size: 1000,
  }),
  onSuccess: (res) => {
    console.log('[item list]', res?.data?.record)
  },
})

const itemId = ref<number>()
</script>

<template>
  <div class="w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <div class="custom-control-panel absolute left-2 top-2 bottom-2 bg-slate-600 rounded flex flex-col items-start p-2 gap-2">
      <el-select-v2
        v-model="activeName"
        :options="layerOptions"
        filterable
      />
      <div class="flex gap-1">
        <el-tree-select
          v-model="areaId"
          :data="areaTree"
          :props="{ label: 'name', value: 'areaId' }"
          class="w-30"
          placeholder="地区"
          filterable
          clearable
          collapse-tags
          collapse-tags-tooltip
        />
        <el-tree-select
          v-model="typeId"
          :data="typeTree"
          :props="{ label: 'name', value: 'typeId' }"
          class="w-30"
          placeholder="类型"
          filterable
          clearable
          collapse-tags
          collapse-tags-tooltip
        />
      </div>
      <CtrlItemGroup v-model="itemId" class="flex-1" :item-list="itemList" :area-id="areaId" />
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
