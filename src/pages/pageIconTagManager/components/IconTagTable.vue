<script lang="ts" setup>
import { ElTable } from 'element-plus'
import { AppUserPopover } from '@/components'
import { useUserPopover } from '@/hooks'

const props = defineProps<{
  selections: API.TagVo[]
  iconTagList: API.TagVo[]
  userMap: Record<string, API.SysUserSmallVo>
  loading: boolean
}>()

const emits = defineEmits<{
  'update:selections': [API.TagVo[]]
}>()

const tableContainerRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableContainerRef)

const tableRef = ref<InstanceType<typeof ElTable> | null>(null)

watch(() => props.iconTagList, () => tableRef.value?.scrollTo({
  top: 0,
}))

const typeAssert = (row: unknown) => row as API.TagVo

const timeFormatter = (_: unknown, __: unknown, time = '') => new Date(time).toLocaleString()

const { IDENTIFICATION_SYMBOL, triggerRef, userData, trigger, close } = useUserPopover({
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

    <ElTable
      ref="tableRef"
      :data="iconTagList"
      :max-height="height"
      :height="height"
      :border="true"
      row-key="id"
      cell-class-name="whitespace-nowrap"
      style="width: 100%"
      @selection-change="(v) => emits('update:selections', v)"
    >
      <el-table-column type="selection" align="center" :width="50" />

      <el-table-column label="ID" prop="id" :width="60" />

      <el-table-column label="图标" prop="url" :width="60">
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

      <el-table-column label="Tag" prop="tag" />

      <el-table-column label="类型" prop="typeIdList" :width="100" />

      <el-table-column label="创建人" prop="creatorId" :width="160">
        <template #default="{ row }">
          <el-tag
            v-if="userMap[row.creatorId]"
            :data-symbol="IDENTIFICATION_SYMBOL"
            :data-user-id="row.creatorId"
            disable-transitions
          >
            {{ userMap[row.creatorId]?.nickname ?? `(id: ${row.creatorId})` }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" prop="createTime" :formatter="timeFormatter" :width="160" />

      <el-table-column label="修改人" prop="updaterId" :width="160">
        <template #default="{ row }">
          <el-tag
            v-if="userMap[row.updaterId]"
            :data-symbol="IDENTIFICATION_SYMBOL"
            :data-user-id="row.updaterId"
            disable-transitions
          >
            {{ userMap[row.updaterId]?.nickname ?? `(id: ${row.updaterId})` }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="修改时间" prop="updateTime" :formatter="timeFormatter" :width="160" />

      <el-table-column label="操作" :width="130">
        <template #default="{ row }">
          <slot name="action" :row="typeAssert(row)" />
        </template>
      </el-table-column>
    </ElTable>
  </div>
</template>
