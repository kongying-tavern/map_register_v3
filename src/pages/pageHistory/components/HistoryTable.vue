<script lang="ts" setup>
import { AppUserPopover } from '@/components'
import { useUserPopover } from '@/hooks'
import { timeFormatter } from '@/utils'

const props = defineProps<{
  loading: boolean
  data: API.HistoryVo[]
  userMap: Record<string, API.SysUserSmallVo>
  historyType: number
}>()

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)

const { IDENTIFICATION_SYMBOL, triggerRef, userData, trigger, close } = useUserPopover({
  getUser: userId => props.userMap[userId],
})

const HISTORY_OPTIONS = [
  { label: '点位', value: 4 },
  { label: '物品', value: 3 },
]
const contentColLabel = computed(() => {
  return `被修改${HISTORY_OPTIONS.find(item => item.value === props.historyType)?.label}ID` || ''
})

const EDIT_TYPE_MAP: Map<number, string> = new Map([
  [0, '未知'],
  [1, '新增'],
  [2, '修改'],
  [3, '删除'],
])
</script>

<template>
  <div
    ref="tableRef"
    v-loading="loading"
    element-loading-text="载入中..."
    class="flex-1 overflow-hidden"
    @pointerover="trigger"
    @pointerout="close"
  >
    <AppUserPopover :trigger-ref="triggerRef" :data="userData" />

    <el-table
      :data="data"
      :height="height"
      :border="true"
    >
      <el-table-column type="expand" :width="40">
        <template #default="{ row }">
          <pre class="px-2">{{ JSON.parse(row.content) }}</pre>
        </template>
      </el-table-column>

      <el-table-column label="ID" prop="id" :width="300" />

      <el-table-column label="操作类型" prop="editType" :width="100">
        <template #default="{ row }">
          <pre>{{ EDIT_TYPE_MAP.get(row.editType) }}</pre>
        </template>
      </el-table-column>

      <el-table-column :label="contentColLabel" prop="tid" :width="300">
        <template #default="{ row }">
          <pre>{{ row.content.length }}</pre>
        </template>
      </el-table-column>

      <el-table-column label="IP" prop="ipv4" :width="150">
        <template #default="{ row }">
          <pre>{{ row.ipv4 }}</pre>
        </template>
      </el-table-column>

      <el-table-column label="MD5" prop="md5" :width="300">
        <template #default="{ row }">
          <pre>{{ row.md5 }}</pre>
        </template>
      </el-table-column>

      <el-table-column label="用户" prop="creatorId" :width="150">
        <template #default="{ row }">
          <el-tag
            disable-transitions
            :data-symbol="IDENTIFICATION_SYMBOL"
            :data-user-id="row.creatorId"
          >
            {{ userMap[row.creatorId]?.nickname ?? `(id: ${row.creatorId})` }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作时间" prop="createTime" :formatter="timeFormatter" />
    </el-table>
  </div>
</template>
