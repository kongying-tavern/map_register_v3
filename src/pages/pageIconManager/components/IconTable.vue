<script lang="ts" setup>
import { AppUserPopover } from '@/components'
import { useUserPopover } from '@/hooks'

const props = defineProps<{
  iconList: API.IconVo[]
  userMap: Record<string, API.SysUserSmallVo>
  loading: boolean
}>()

const tableContainerRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableContainerRef)

const urlFormatter = (_: unknown, __: unknown, url = '') => decodeURIComponent(url)
const timeFormatter = (_: unknown, __: unknown, time = '') => new Date(time).toLocaleString()

const { IDENTIFICATION_SYMBOL, userData, triggerRef, trigger, close } = useUserPopover({
  getUser: userId => props.userMap[userId],
})
</script>

<template>
  <div
    ref="tableContainerRef"
    v-loading="loading"
    class="flex-1 overflow-hidden"
    element-loading-text="加载中..."
    @pointerover="trigger"
    @pointerout="close"
  >
    <AppUserPopover :trigger-ref="triggerRef" :data="userData" />

    <el-table
      :data="iconList"
      :max-height="height"
      :height="height"
      :border="true"
      cell-class-name="whitespace-nowrap"
      style="width: 100%"
    >
      <el-table-column type="selection" align="center" :width="50" />

      <el-table-column label="ID" prop="id" :width="60" />

      <el-table-column label="图标" :width="60">
        <template #default="{ row }">
          <img
            :src="row.url"
            class="w-full aspect-square object-cover rounded border"
            style="background-color: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-8);"
            crossorigin=""
            loading="lazy"
          >
        </template>
      </el-table-column>

      <el-table-column prop="url" label="url" min-width="400px" :formatter="urlFormatter" />

      <el-table-column prop="name" label="名称" width="150px" />

      <el-table-column label="创建人" width="100px">
        <template #default="{ row }">
          <el-tag
            :data-symbol="IDENTIFICATION_SYMBOL"
            :data-user-id="row.creatorId"
            disable-transitions
          >
            {{ userMap[row.creatorId]?.nickname ?? `(id: ${row.creatorId})` }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" :width="160" :formatter="timeFormatter" />

      <el-table-column label="修改人" width="100px">
        <template #default="{ row }">
          <el-tag
            :data-symbol="IDENTIFICATION_SYMBOL"
            :data-user-id="row.updaterId"
            disable-transitions
          >
            {{ userMap[row.updaterId]?.nickname ?? `(id: ${row.updaterId})` }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="updateTime" label="修改时间" :width="160" :formatter="timeFormatter" />

      <el-table-column fixed="right" label="操作" width="130">
        <template #default="{ $index, row }">
          <slot name="action" :index="$index" :row="row" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
