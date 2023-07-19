<script lang="ts" setup>
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
  const sort = order ? [`${prop}${order === 'ascending' ? '+' : '-'}`] : []
  emits('sortChange', sort)
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
  <div ref="tableRef" class="flex-1 overflow-hidden">
    <el-table
      v-loading="loading"
      element-loading-text="载入中..."
      :data="data"
      :height="height"
      :border="true"
      class="user-table"
      @selection-change="proxySelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" />

      <el-table-column label="ID" prop="id" :width="100" />

      <!-- <el-table-column label="头像" prop="logo" show-overflow-tooltip :width="150" /> -->
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <img
            class="w-12 h-12 object-contain rounded border"
            :src="row.logo"
            crossorigin=""
            style="background-color: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-8);"
            v-if="row.logo"
          >
        </template>
      </el-table-column>

      <el-table-column label="用户名" prop="username" :width="150" />

      <el-table-column label="QQ" prop="qq" :width="150" />

      <el-table-column label="昵称" prop="nickname" show-overflow-tooltip sortable="custom" />

      <el-table-column label="手机号" prop="phone" :width="150" />

      <el-table-column label="角色" prop="roleId" :width="120">
        <template #default="{ row }">
          <el-tag disable-transitions>
            {{ roleMap[row.roleId]?.name ?? '...' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="信息更新时间" prop="updateTime" sortable="custom" :width="250" />

      <el-table-column fixed="right" label="操作" :width="190">
        <template #default="{ row }">
          <slot name="action" :row="typeAssert(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
