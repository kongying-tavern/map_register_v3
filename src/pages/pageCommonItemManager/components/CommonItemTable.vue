<script lang="ts" setup>
import { useAreaList, useTypeList, useUserPopover } from '@/hooks'
import { useIconTagStore } from '@/stores'
import { refreshTimeFormatter, timeFormatter } from '@/utils'
import { HIDDEN_FLAG_NAM_MAP } from '@/shared'

const props = defineProps<{
  loading: boolean
  itemList: API.ItemAreaPublicVo[]
  userMap: Record<string, API.SysUserSmallVo>
}>()

const emits = defineEmits<{
  selectionChange: [selections: API.ItemVo[]]
}>()

const iconTagStore = useIconTagStore()

// ==================== 表格尺寸 ====================
const containerRef = ref<HTMLElement | null>(null)
const { height, width } = useElementSize(containerRef)

// ==================== 地区信息 ====================
const { areaMap } = useAreaList({ immediate: true })

// ==================== 物品类型 ====================
const { typeMap } = useTypeList({ immediate: true })

// ==================== 用户信息 ====================
const { IDENTIFICATION_SYMBOL, triggerRef, userData, trigger, close } = useUserPopover({
  getUser: userId => props.userMap[userId],
})

// ==================== 事件代理 ====================
const proxySelectionChange = (selections: API.ItemVo[]) => {
  emits('selectionChange', selections)
}

// ==================== 其他 ====================
/** 类型断言 */
const typeAssert = (row: unknown) => row as API.ItemAreaPublicVo
</script>

<template>
  <div
    ref="containerRef"
    v-loading="loading"
    class="flex-1 overflow-hidden"
    element-loading-text="加载中..."
    @pointerover="trigger"
    @pointerout="close"
  >
    <AppUserPopover :trigger-ref="triggerRef" :data="userData" />

    <el-table
      :data="itemList"
      :width="width"
      :height="height"
      :border="true"
      row-key="id"
      @selection-change="proxySelectionChange"
    >
      <el-table-column align="center" type="selection" width="50" />

      <el-table-column label="ID" prop="id" width="70" />

      <el-table-column label="图标" width="60">
        <template #default="{ row }">
          <img
            class="w-8 h-8 object-contain rounded border"
            :src="iconTagStore.iconTagMap[row.iconTag ?? ''].url"
            crossorigin=""
            style="background-color: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-8);"
          >
        </template>
      </el-table-column>

      <el-table-column label="物品名称" prop="name" width="200" />

      <el-table-column label="所属地区" width="150">
        <template #default="{ row }">
          <div>{{ areaMap[row.areaId]?.name ?? row.areaId }}</div>
        </template>
      </el-table-column>

      <el-table-column label="物品类型" prop="typeIdList" width="150">
        <template #default="{ row }">
          <el-tag v-for="typeId in row.typeIdList" :key="typeId" disable-transitions type="success" class="mr-1">
            {{ typeMap[typeId].name }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="描述模板" prop="defaultContent" width="200" show-overflow-tooltip />

      <el-table-column label="刷新时间" prop="defaultRefreshTime" width="100" :formatter="refreshTimeFormatter" />

      <el-table-column label="显示类型" prop="hiddenFlag" width="100">
        <template #default="{ row }">
          {{ HIDDEN_FLAG_NAM_MAP[row.hiddenFlag] ?? '未知' }}
        </template>
      </el-table-column>

      <el-table-column label="创建人" prop="creatorId" width="100">
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

      <el-table-column label="创建时间" prop="createTime" width="170" :formatter="timeFormatter" />

      <el-table-column label="修改人" prop="updaterId" width="100">
        <template #default="{ row }">
          <el-tag
            disable-transitions
            :data-symbol="IDENTIFICATION_SYMBOL"
            :data-user-id="row.updaterId"
          >
            {{ userMap[row.updaterId]?.nickname ?? `(id: ${row.updaterId})` }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="修改时间" prop="updateTime" width="170" :formatter="timeFormatter" />

      <el-table-column fixed="right" label="操作" width="71">
        <template #default="{ $index, row }">
          <slot name="action" :index="$index" :row="typeAssert(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
