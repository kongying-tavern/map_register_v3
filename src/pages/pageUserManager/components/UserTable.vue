<script lang="ts" setup generic="T">
import { timeFormatter } from '@/utils'

const props = defineProps<{
  loading: boolean
  roleList: API.SysRoleVo[]
  data: T[]
}>()

const emits = defineEmits<{
  viewRow: [T]
}>()

const roleMap = computed(() => Object.fromEntries(props.roleList.map(role => [role.id!, role])))

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)
</script>

<template>
  <div ref="tableRef" v-loading="loading" element-loading-text="载入中..." class="flex-1 overflow-hidden px-2">
    <el-table
      :data="data"
      :height="height"
      table-layout="auto"
    >
      <el-table-column label="ID" prop="id" :width="100" />

      <el-table-column label="头像" width="80" class="custom">
        <template #default="{ row }">
          <div class="w-10 h-10 rounded border border-[var(--el-color-primary-light-8)] bg-[var(--el-color-primary-light-9)]">
            <img
              v-if="row.logo"
              class="w-full h-full object-contain"
              :src="row.logo"
            >
          </div>
        </template>
      </el-table-column>

      <el-table-column label="昵称" :width="200" prop="nickname" show-overflow-tooltip />

      <el-table-column label="用户名" :width="200" prop="username">
        <template #default="{ row }">
          <div
            class="
              text-[var(--el-color-primary)]
              underline underline-offset-4 decoration-[var(--el-color-primary)] decoration-dashed
              hover:decoration-solid
              cursor-pointer
            "
            @click="() => emits('viewRow', row)"
          >
            {{ row.username }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="QQ" prop="qq" :width="150" />

      <el-table-column label="手机号" prop="phone" :width="150" />

      <el-table-column label="角色" prop="roleId">
        <template #default="{ row }">
          <el-tag disable-transitions>
            {{ roleMap[row.roleId]?.name ?? '...' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="修改时间" prop="updateTime" :width="180" :formatter="timeFormatter" />
    </el-table>
  </div>
</template>
