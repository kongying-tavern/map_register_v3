<script lang="ts" setup>
import type { Column } from 'element-plus'
import { FixedDir } from 'element-plus/es/components/table-v2/src/constants'
import { useCurrentLayerMarkers } from '@/pages/pageMapV2/hooks'

const tableContainerRef = ref<HTMLElement | null>()
const { width, height } = useElementSize(tableContainerRef)

const { markers } = useCurrentLayerMarkers()

const columns = ref<Column<API.MarkerVo>[]>([
  { title: '名称', dataKey: 'markerTitle', width: 100, fixed: FixedDir.LEFT },
  { title: 'id', dataKey: 'id', width: 80 },
  { title: '说明', dataKey: 'content', width: 200 },
])

const queryText = ref('')
const filteredMarkers = shallowRef(markers.value)

watch(queryText, useDebounceFn(() => {
  const queryUnits: string[] = queryText.value.trim().match(/\S+\S+/g) ?? []
  const queryMap = Object.fromEntries(queryUnits.map(g => g.split(':')))
  const { name = '', id = '', content = '' } = queryMap
  filteredMarkers.value = markers.value.filter((marker) => {
    const isNameMatched = !name || Boolean(marker.markerTitle?.includes(name))
    const isIdMatched = !id || Boolean(`${marker.id}`.includes(id))
    const isContentMatched = !content || Boolean(marker.content?.includes(content))
    return isNameMatched && isIdMatched && isContentMatched
  })
}, 500))
</script>

<template>
  <div class="marker-filter h-full flex flex-col">
    <div class="p-2">
      <el-input v-model="queryText" class="w-full" placeholder="name:草神瞳 id:42 content:地下">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>
    <div ref="tableContainerRef" class="flex-1 overflow-hidden">
      <el-table-v2
        :columns="columns"
        :data="filteredMarkers"
        :width="width"
        :height="height"
        class="marker-table"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marker-table {
  --el-bg-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-border-color: transparent;
  --el-table-row-hover-bg-color: #ffffff20;
  color: #E4DDD1;
}
</style>
