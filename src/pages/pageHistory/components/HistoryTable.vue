<script lang="ts" setup>
import { AppUserPopover } from '@/components'
import { useUserPopover } from '@/hooks'
import { timeFormatter } from '@/utils'

const props = defineProps<{
  loading: boolean
  data: API.HistoryVo[]
  userMap: Record<string, API.SysUserSmallVo>
}>()

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)

const { IDENTIFICATION_SYMBOL, triggerRef, userData, trigger, close } = useUserPopover({
  getUser: userId => props.userMap[userId],
})
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

      <el-table-column label="ID" prop="id" :width="100" />

      <el-table-column label="操作类型" prop="" :width="100" />

      <el-table-column label="内容" prop="content" :width="300">
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

      <el-table-column label="操作时间" prop="createTime" :width="160" :formatter="timeFormatter" />
    </el-table>
  </div>
</template>
