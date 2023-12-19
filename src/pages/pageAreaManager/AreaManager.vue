<script lang="ts" setup>
import { Delete, Edit, RefreshRight } from '@element-plus/icons-vue'
import { useAreaDelete, useAreaList, useParentArea } from './hooks'
import { AreaCreator, AreaEditor, AreaTable } from './components'
import { useGlobalDialog, useState } from '@/hooks'

const { DialogService } = useGlobalDialog()
const getDialogConfig = (title: string) => ({
  title,
  width: 'fit-content',
  alignCenter: true,
  showClose: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
})

const { parent, parentPath, goto } = useParentArea()

const { areaList, userMap, loading, updateAreaList } = useAreaList({
  getParams: () => ({
    parentId: parent.value?.id,
  }),
})

const [selections, setSelections] = useState<API.AreaVo[]>([])

// ==================== 新增地区 ====================
const openAreaCreator = () => DialogService
  .config(getDialogConfig('添加地区'))
  .props({ parent })
  .listeners({ success: updateAreaList })
  .open(AreaCreator)

// ==================== 编辑地区 ====================
const openAreaEditor = (area: API.AreaVo) => DialogService
  .config(getDialogConfig('添加地区'))
  .props({ area, parent })
  .listeners({ success: updateAreaList })
  .open(AreaEditor)

// ==================== 删除地区 ====================
const { confirmDelete, onSuccess: onDeleteSuccss } = useAreaDelete()
onDeleteSuccss(updateAreaList)
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <div class="text-end">
      <el-button type="danger" :disabled="!selections.length" @click="() => confirmDelete(selections)">
        批量删除 {{ selections.length ? ` ${selections.length} 项` : '' }}
      </el-button>
      <el-button type="primary" @click="openAreaCreator">
        添加地区
      </el-button>
      <el-button :icon="RefreshRight" :loading="loading" circle @click="updateAreaList" />
    </div>

    <div class="h-5 overflow-hidden">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <template v-if="!parentPath.length">
            根分类
          </template>
          <el-link v-else @click="() => goto()">
            根分类
          </el-link>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="parentItem in parentPath" :key="parentItem.id!">
          <template v-if="parentItem.id === parent?.id">
            {{ parentItem.name }}
          </template>
          <el-link v-else @click="() => goto(parentItem)">
            {{ parentItem.name }}
          </el-link>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <AreaTable
      v-model:parent-path="parentPath"
      :area-list="areaList"
      :user-map="userMap"
      :loading="loading"
      @selection-change="setSelections"
    >
      <template #action="{ row }">
        <el-button :icon="Edit" @click="() => openAreaEditor(row)" />
        <el-button :icon="Delete" plain type="danger" @click="() => confirmDelete(row)" />
      </template>
    </AreaTable>
  </div>
</template>
