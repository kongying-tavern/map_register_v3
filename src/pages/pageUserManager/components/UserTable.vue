<script lang="ts" setup>
import { timeFormatter } from '@/utils'

const props = defineProps<{
  loading: boolean
  roleList: API.SysRoleVo[]
  data: API.SysUserVo[]
}>()

const emits = defineEmits<{
  'selectionChange': [selections: API.SysUserVo[]]
  'sortChange': [sort: string[]]
}>()

const roleMap = computed(() => Object.fromEntries(props.roleList.map(role => [role.id!, role])))

const handleSortChange = ({ order, prop }: { order: 'ascending' | 'descending' | null; prop: string }) => {
  emits('sortChange', order ? [`${prop}${order === 'ascending' ? '+' : '-'}`] : [])
}

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)

/** 类型断言 */
const typeAssert = (row: unknown) => row as API.SysUserVo

// ==================== 事件代理 ====================
const proxySelectionChange = (selections: API.ItemVo[]) => {
  emits('selectionChange', selections)
}
</script>

<template>
  <div ref="tableRef" v-loading="loading" element-loading-text="载入中..." class="flex-1 overflow-hidden">
    <el-table
      :data="data"
      :height="height"
      :border="true"
      @selection-change="proxySelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" align="center" :width="50" />

      <el-table-column label="ID" prop="id" :width="100" sortable="custom" />

      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <img
            v-if="row.logo"
            class="w-12 h-12 object-contain rounded border"
            :src="row.logo"
            style="background-color: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-8);"
          >
        </template>
      </el-table-column>

      <el-table-column label="昵称" prop="nickname" show-overflow-tooltip sortable="custom" :width="150" />

      <el-table-column label="用户名" prop="username" :width="150" />

      <el-table-column label="QQ" prop="qq" :width="150" />

      <el-table-column label="手机号" prop="phone" :width="150" />

      <el-table-column label="角色" prop="roleId" :width="120">
        <template #default="{ row }">
          <el-tag disable-transitions>
            {{ roleMap[row.roleId]?.name ?? '...' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="修改时间" prop="updateTime" sortable="custom" :width="180" :formatter="timeFormatter" />

      <el-table-column fixed="right" label="操作" :width="190">
        <template #default="{ row }">
          <slot name="action" :row="typeAssert(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
