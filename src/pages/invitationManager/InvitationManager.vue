<script setup lang="ts">
import type { InvitationFilterOptions, InvitationSortOptions } from './types'
import Api from '@/api/api'
import { PgUnit, useFetchHook, useGlobalDialog, usePagination } from '@/hooks'
import { ManagerModule } from '@/shared'
import { timeFormatter } from '@/utils'
import * as ElIcons from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { InvitationEditor } from './components'
import InvitationDeleteConfirm from './components/InvitationDeleteConfirm.vue'
import InvitationHeader from './components/InvitationHeader.vue'

const { DialogService } = useGlobalDialog()

// table
const tableRef = ref<HTMLElement>()
const { height } = useElementSize(tableRef)

const { pagination, layout, onChange: onPaginationChange } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.JUMPER, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
  module: ManagerModule.Invitation,
})

const filter = ref<InvitationFilterOptions>({
  key: 'username',
  value: '',
})

const sorts = ref<InvitationSortOptions>({
  key: 'createTime',
  type: '-',
})

// ====================== list data ======================
const { data, loading, refresh, onSuccess } = useFetchHook({
  initialValue: {
    record: [],
    total: 0,
    users: new Map(),
  },
  immediate: true,
  onRequest: async () => {
    const { current, pageSize: size } = pagination.value
    const { key: filterKey, value: filterValue = '' } = filter.value
    const { key: sortKey, type: sortType } = sorts.value
    const trimedFilterValue = filterValue.trim()
    const { data: { record = [], total = 0 } = {}, users = {} } = await Api.invitation.listInvitation({
      sort: [`${sortKey}${sortType}`],
      current,
      size,
      ...(trimedFilterValue.length
        ? {
            [filterKey]: trimedFilterValue,
          }
        : {}),
    })
    const userMap = Object.entries(users).reduce((map, [userId, userInfo]) => {
      return map.set(Number(userId), userInfo)
    }, new Map<number, API.SysUserSmallVo>())
    return { record, total, users: userMap }
  },
})
onSuccess(({ total }) => {
  pagination.value.total = total
})
onPaginationChange(refresh)

const openInvitationCreator = () => {
  DialogService
    .config({
      alignCenter: true,
      closeOnClickModal: true,
      closeOnPressEscape: false,
      width: 300,
    })
    .props({
      title: '新增邀请码',
    })
    .listeners({
      success: refresh,
    })
    .open(InvitationEditor)
}

const openInvitationEditor = (data: API.SysUserInvitationVo) => {
  DialogService
    .config({
      alignCenter: true,
      closeOnClickModal: true,
      closeOnPressEscape: false,
      width: 300,
    })
    .props({
      title: '编辑邀请码',
      data,
    })
    .listeners({
      success: refresh,
    })
    .open(InvitationEditor)
}

const openInvitationDeleteConfirm = (data: API.SysUserInvitationVo) => {
  DialogService
    .config({
      alignCenter: true,
      closeOnClickModal: true,
      closeOnPressEscape: false,
      width: 300,
    })
    .props({
      data,
    })
    .listeners({
      success: refresh,
    })
    .open(InvitationDeleteConfirm)
}

const copyInvitationCode = async ({ code }: API.SysUserInvitationVo) => {
  if (!code)
    return
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('邀请码已复制到剪贴板')
  }
  catch {
    // cancel
  }
}

const handleRowClick = (data: API.SysUserInvitationVo, col: { property?: string }) => {
  const { property = '' } = col
  return ({
    code: () => copyInvitationCode(data),
    username: () => openInvitationEditor(data),
  } as Record<string, () => void>)[property]?.()
}

const getCellClassName = (cell: { column: { property?: string } }) => {
  const { property } = cell.column
  if (!property)
    return ''
  return `prop-${property}`
}

const codeFormatter = (...{ 2: code = '' }) => {
  return code.slice(-12)
}

const userFormatter = (...{ 2: uid = -1 }) => {
  return data.value.users.get(uid)?.nickname ?? `(UID: ${uid})`
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <InvitationHeader
      v-model:filter="filter"
      v-model:sorts="sorts"
      :loading="loading"
      @change="refresh"
      @create="openInvitationCreator"
    />

    <div
      ref="tableRef"
      v-loading="loading"
      element-loading-text="载入中..."
      class="flex-1 overflow-hidden px-2"
    >
      <el-table
        :data="data.record"
        :height="height"
        :cell-class-name="getCellClassName"
        table-layout="auto"
        class="invitation-table"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" :width="50" />

        <el-table-column prop="username" label="用户名" :width="100" />

        <el-table-column prop="remark" label="用户备注" :width="100" />

        <el-table-column prop="roldId" label="角色" :width="100" />

        <el-table-column prop="code" label="邀请码" :width="150" :formatter="codeFormatter" />

        <el-table-column prop="creatorId" label="创建人" :width="100" :formatter="userFormatter" />

        <el-table-column prop="createTime" label="创建时间" :formatter="timeFormatter" />

        <el-table-column fixed="right" label="操作" :width="60">
          <template #default="{ row }">
            <el-button
              type="danger"
              text
              circle
              :icon="ElIcons.Delete"
              @click="() => openInvitationDeleteConfirm(row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="pagination.sizes"
      :pager-count="5"
      :disabled="loading"
      class="flex justify-end items-center p-2"
      background
    />
  </div>
</template>

<style scoped>
.invitation-table {
  :deep(.el-table__cell) {
    .cell {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /** 用户名列的特殊样式 */
    &.prop-username {
      font-weight: bolder;
      text-decoration: underline 1px dashed;
      text-underline-offset: 4px;
      cursor: pointer;

      &:hover {
        text-decoration-style: solid;
      }
    }

    /** 邀请码列的特殊样式 */
    &.prop-code {
      cursor: pointer;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
