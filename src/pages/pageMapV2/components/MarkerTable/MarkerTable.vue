<script lang="tsx" setup>
import type { Column } from 'element-plus'
import { MarkerButton } from '.'
import { GSSwitch } from '@/components'
import { useCurrentLayerMarkers } from '@/pages/pageMapV2/hooks'

interface MarkerWithDetail extends API.MarkerVo {
  children: {
    id: string
    detail?: string
  }[]
}

const tableContainerRef = ref<HTMLElement | null>()
const { width, height } = useElementSize(tableContainerRef)

const { markers } = useCurrentLayerMarkers()

const columns = ref<Column[]>([
  { title: '点位名称', key: 'markerTitle', width: 100, cellRenderer: ({ rowData: data }) => <MarkerButton data={data} /> },
  { title: 'id', key: 'id', dataKey: 'id', width: 80 },
  { title: '点位说明', key: 'content', dataKey: 'content', width: 140, flexGrow: 1 },
])

const queryText = ref('')
const queryUnits = computed(() => (queryText.value.trim().match(/\S+\S+/g) ?? []) as string[])
const queryMap = computed(() => Object.fromEntries(queryUnits.value.map(g => g.split(':'))))

/** 为数据对象添加 children 字段以便 el-table-v2 对可展开内容的渲染 */
const markersHandler = (seed: MarkerWithDetail[], marker: API.MarkerVo) => {
  const { name = '', id = '', content = '' } = queryMap.value
  const isNameMatched = !name || Boolean(marker.markerTitle?.includes(name))
  const isIdMatched = !id || Boolean(`${marker.id}`.includes(id))
  const isContentMatched = !content || Boolean(marker.content?.includes(content))
  const isTrueMarker = isNameMatched && isIdMatched && isContentMatched
  isTrueMarker && seed.push({
    ...marker,
    children: [{
      id: `${marker.id}-detail-content`,
      detail: marker.content,
    }],
  })
  return seed
}

const filteredMarkers = shallowRef(markers.value.reduce(markersHandler, [] as MarkerWithDetail[]))
watch(queryText, useDebounceFn(() => {
  filteredMarkers.value = markers.value.reduce(markersHandler, [] as MarkerWithDetail[])
}, 500))

interface RowSlotProps {
  cells: VNode[]
  rowData: API.MarkerVo | MarkerWithDetail['children']
}

const Row = ({ cells, rowData }: RowSlotProps) => {
  if ('detail' in rowData)
    return <div class="expand-content p-1">{rowData.detail}</div>
  return cells
}
Row.inheritAttrs = false

const expandAll = ref(false)
const expandedRowKeys = computed(() => expandAll.value ? filteredMarkers.value.map(marker => marker.id) : [])
</script>

<template>
  <div class="marker-filter h-full flex flex-col">
    <div class="p-2 flex flex-col gap-2">
      <GSSwitch v-model="expandAll" label="默认展开说明" />
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
        :cache="15"
        :width="width"
        :height="height"
        :estimated-row-height="50"
        :expanded-row-keys="expandedRowKeys"
        expand-column-key="content"
        class="marker-table"
        header-class="marker-table-header"
        fixed
        h-scrollbar-size="0"
      >
        <template #row="props">
          <Row v-bind="props" />
        </template>
      </el-table-v2>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marker-table {
  --el-bg-color: transparent;
  // --el-table-bg-color: transparent;
  --el-table-border-color: transparent;
  --el-table-row-hover-bg-color: #ffffff20;
  color: #E4DDD1;

  :deep(.el-table-v2__row-depth-0) {
    height: 50px;
  }

  :deep(.el-table-v2__header-row) {
    background: #00000020;
  }

  :deep(.el-table-v2__cell-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.expand-content) {
    background: #141b22;
  }
}
</style>
