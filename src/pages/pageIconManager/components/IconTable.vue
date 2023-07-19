<script lang="ts" setup>
import { UserInfo } from '.'

defineProps<{
  iconList: API.IconVo[]
  loading: boolean
  userList: Record<number, API.SysUserSmallVo>
}>()

const tableContainerRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableContainerRef)

const urlFormatter = (_: unknown, __: unknown, url = '') => decodeURIComponent(url)
const timeFormatter = (_: unknown, __: unknown, time = '') => new Date(time).toLocaleString()
</script>

<template>
  <div ref="tableContainerRef" v-loading="loading" class="flex-1 overflow-hidden" element-loading-text="加载中...">
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

      <el-table-column label="最新更改者" width="150px">
        <template #default="scope">
          <UserInfo :userId="scope.row.updaterId" :userList="userList" />
        </template>
      </el-table-column>

      <el-table-column prop="updateTime" label="修改时间" :width="160" :formatter="timeFormatter" />

      <el-table-column label="作者" width="150px">
        <template #default="scope">
          <UserInfo :userId="scope.row.creatorId" :userList="userList" />
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" :width="160" :formatter="timeFormatter" />

      <el-table-column fixed="right" label="操作" width="130">
        <template #default="{ $index, row }">
          <slot name="action" :index="$index" :row="row" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
