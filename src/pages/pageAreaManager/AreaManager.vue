<script lang="ts" setup>
import { useGlobalDialog } from '@/hooks'
import { AreaCreator, AreaDeleteConfirm, AreaEditor } from './components'
import { useAreaList, useGraph } from './hooks'

const { DialogService } = useGlobalDialog()
const getDialogConfig = () => ({
  width: 'fit-content',
  alignCenter: true,
  closeOnClickModal: false,
  closeOnPressEscape: false,
})

const { data, updateAreaList } = useAreaList()

// ==================== 地图图表 ====================
const containerRef = ref<HTMLElement>()
const minimapRef = ref<HTMLDivElement>()

const { graph, onEditClick, onAddClick, onDeleteClick } = useGraph({
  containerRef,
  minimapRef,
  data,
})

// ==================== 新增地区 ====================
const openAreaCreator = (parent?: API.AreaVo) => DialogService
  .config(getDialogConfig())
  .props({ parent })
  .listeners({
    success: (form: API.AreaVo) => {
      graph.value?.addChild({
        id: `${form.id}`,
        pid: `${form.parentId}`,
        label: form.name,
        raw: form,
      }, `${form.parentId}`)
      updateAreaList()
    },
  })
  .open(AreaCreator)

// ==================== 编辑地区 ====================
const openAreaEditor = (area: API.AreaVo, parent?: API.AreaVo) => DialogService
  .config(getDialogConfig())
  .props({ area, parent })
  .listeners({
    success: (form: API.AreaVo) => {
      graph.value?.update(`${form.id}`, {
        id: `${form.id}`,
        pid: `${form.parentId}`,
        label: form.name,
        raw: form,
      })
      updateAreaList()
    },
  })
  .open(AreaEditor)

// ==================== 删除地区 ====================
const deleteArea = (area: API.AreaVo) => DialogService
  .config(getDialogConfig())
  .props({
    title: '删除地区',
    area,
  })
  .listeners({
    success: (form: API.AreaVo) => {
      graph.value?.removeChild(`${form.id}`)
      updateAreaList()
    },
  })
  .open(AreaDeleteConfirm)

onEditClick(([area, parent]) => openAreaEditor(area, parent))
onAddClick(([parent]) => openAreaCreator(parent))
onDeleteClick(([area]) => deleteArea(area))
</script>

<template>
  <div class="h-full overflow-hidden relative">
    <div ref="containerRef" class="w-full h-full select-none" />
    <div ref="minimapRef" class="absolute left-4 bottom-4 border border-[var(--el-border-color)] bg-[var(--el-bg-color)]" />
  </div>
</template>
