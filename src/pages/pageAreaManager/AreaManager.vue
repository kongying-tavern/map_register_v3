<script lang="ts" setup>
import { useAreaList, useGraph } from './hooks'
import { AreaCreator, AreaDeleteConfirm, AreaEditor } from './components'
import { useGlobalDialog } from '@/hooks'

const { DialogService } = useGlobalDialog()
const getDialogConfig = () => ({
  width: 'fit-content',
  alignCenter: true,
  closeOnClickModal: false,
  closeOnPressEscape: false,
})

const { data, updateAreaList } = useAreaList()

// ==================== 新增地区 ====================
const openAreaCreator = (parent?: API.AreaVo) => DialogService
  .config(getDialogConfig())
  .props({ parent })
  .listeners({ success: updateAreaList })
  .open(AreaCreator)

// ==================== 编辑地区 ====================
const openAreaEditor = (area: API.AreaVo, parent?: API.AreaVo) => DialogService
  .config(getDialogConfig())
  .props({ area, parent })
  .listeners({ success: updateAreaList })
  .open(AreaEditor)

// ==================== 删除地区 ====================
const deleteArea = (area: API.AreaVo) => DialogService
  .config(getDialogConfig())
  .props({
    title: '删除地区',
    area,
  })
  .listeners({
    success: updateAreaList,
  })
  .open(AreaDeleteConfirm)

// ==================== 地图图表 ====================
const containerRef = ref<HTMLElement | null>(null)
const minimapRef = ref<HTMLDivElement | null>(null)

const { onEditClick, onAddClick, onDeleteClick } = useGraph({
  containerRef,
  minimapRef,
  data,
})

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
