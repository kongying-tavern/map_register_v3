<script lang="ts" setup>
import { Delete, Edit } from '@element-plus/icons-vue'
import type { TypeManagerKeys } from './definitions'
import { TYPE_MANAGER_KEY_MAP, TYPE_MANAGER_OPTIONS } from './definitions'
import { useTypeDelete, useTypeList } from './hooks'
import type { TypeObject } from './config'
import { TypeCreator, TypeEditor, TypeTable } from './components'
import { PgUnit, useGlobalDialog, usePagination, useState } from '@/hooks'

const { DialogService } = useGlobalDialog()
const getDialogConfig = (title: string) => ({
  title,
  width: 'fit-content',
  showClose: false,
  alignCenter: true,
  closeOnClickModal: false,
  closeOnPressEscape: false,
})

// ==================== 分页参数 ====================
const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

// ==================== 表格参数 ====================
const [selections, setSelections] = useState<TypeObject[]>([])

const typeKey = ref<TypeManagerKeys>('itemType')
const manager = computed(() => TYPE_MANAGER_KEY_MAP[typeKey.value])

// ==================== 分类级别 ====================
const parentPath = ref<TypeObject[]>([])
const parent = computed(() => parentPath.value.at(-1))

const goto = (newParent?: TypeObject) => {
  if (!newParent) {
    parentPath.value = []
    return
  }
  const fineIndex = parentPath.value.findIndex(fintParent => fintParent.id === newParent.id)
  if (fineIndex > -1) {
    parentPath.value = parentPath.value.slice(0, fineIndex + 1)
    return
  }
  parentPath.value.push(newParent)
}

watch(typeKey, () => {
  parentPath.value = []
})

// ==================== 分类列表 ====================
const { typeList, userMap, loading, updateTypeList } = useTypeList({
  typeKey,
  pagination,
  getParams: () => ({
    typeIdList: parent.value ? [parent.value.id!] : [-1],
  }),
})

// ==================== 添加分类 ====================
const openTypeCreator = () => DialogService
  .config(getDialogConfig(`添加${manager.value.info.label}`))
  .props({
    parent: parent.value,
    manager: manager.value,
  })
  .listeners({ success: updateTypeList })
  .open(TypeCreator)

// ==================== 编辑分类 ====================
const openTypeEditor = (data: TypeObject) => DialogService
  .config(getDialogConfig(`编辑${manager.value.info.label}`))
  .props({
    data,
    parent: parent.value,
    manager: manager.value,
  })
  .listeners({ success: updateTypeList })
  .open(TypeEditor)

// ==================== 删除分类 ====================
const { confirmDelete } = useTypeDelete(manager)
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <el-form>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
        <el-form-item label="管理项目">
          <el-select-v2 v-model="typeKey" :options="TYPE_MANAGER_OPTIONS" />
        </el-form-item>
        <el-form-item v-for="i in 2" :key="i" />
        <el-form-item>
          <div class="w-full flex justify-end">
            <el-button type="danger" :disabled="!selections.length" @click="() => confirmDelete(selections)">
              批量删除 {{ selections.length ? ` ${selections.length} 项` : '' }}
            </el-button>
            <el-button type="primary" @click="openTypeCreator">
              添加{{ manager.info.label }}
            </el-button>
          </div>
        </el-form-item>
      </div>
    </el-form>

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
        <el-breadcrumb-item v-for="parentItem in parentPath" :key="parentItem">
          <template v-if="parentItem.id === parent?.id">
            {{ parentItem.name }}
          </template>
          <el-link v-else @click="() => goto(parentItem)">
            {{ parentItem.name }}
          </el-link>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <TypeTable
      :data="typeList"
      :user-map="userMap"
      :loading="loading"
      :manager="manager"
      @selection-change="setSelections"
      @goto-type-node="goto"
    >
      <template #action="{ row }">
        <el-button :icon="Edit" @click="() => openTypeEditor(row)" />
        <el-button :icon="Delete" plain type="danger" @click="() => confirmDelete(row)" />
      </template>
    </TypeTable>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :disabled="loading"
      :total="pagination.total"
      :layout="layout"
      :pager-count="5"
      :page-sizes="[10, 20, 30]"
      background
      class="flex justify-end items-center"
      @current-change="updateTypeList"
      @size-change="updateTypeList"
    />
  </div>
</template>
