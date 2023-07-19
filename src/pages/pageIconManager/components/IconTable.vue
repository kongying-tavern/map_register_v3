<script lang="ts" setup>
defineProps<{
  iconList: API.IconVo[]
  userMap: Record<string, API.SysUserSmallVo>
  loading: boolean
}>()

const tableContainerRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableContainerRef)

const urlFormatter = (_: unknown, __: unknown, url = '') => decodeURIComponent(url)
const timeFormatter = (_: unknown, __: unknown, time = '') => new Date(time).toLocaleString()

const userData = ref<API.SysUserSmallVo | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const setPopoverTarget = (ev: MouseEvent, data: API.SysUserSmallVo) => {
  if (!(ev.target instanceof HTMLElement))
    return
  userData.value = data
  triggerRef.value = ev.target
}
const blurPopover = () => {
  triggerRef.value = null
}
</script>

<template>
  <div ref="tableContainerRef" v-loading="loading" class="flex-1 overflow-hidden" element-loading-text="加载中...">
    <el-popover
      :virtual-ref="triggerRef"
      :visible="Boolean(triggerRef)"
      :width="userData?.logo ? '260px' : '130px'"
      virtual-triggering
      placement="top"
    >
      <div
        v-if="userData"
        class="grid gap-x-2"
        :style="[
          `grid-template-columns: ${userData.logo ? 'auto' : ''} 1fr`,
        ]"
      >
        <img
          v-if="userData.logo"
          :src="userData.logo"
          class="w-24 rounded aspect-square row-span-4"
          style="border-color: var(--el-color-primary-light-8); background-color: var(--el-color-primary-light-9);"
        >
        <div class="whitespace-nowrap overflow-hidden text-ellipsis">
          账号：{{ userData.username }}
        </div>
        <div class="whitespace-nowrap overflow-hidden text-ellipsis">
          昵称：{{ userData.nickname }}
        </div>
        <div class="whitespace-nowrap overflow-hidden text-ellipsis">
          Q号：{{ userData.qq || '--' }}
        </div>
        <div class="whitespace-nowrap overflow-hidden text-ellipsis">
          手机：{{ userData.phone || '--' }}
        </div>
      </div>
    </el-popover>

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
            v-if="userMap[row.creatorId]"
            disable-transitions
            @pointerenter="(ev: PointerEvent) => setPopoverTarget(ev, userMap[row.creatorId])"
            @pointerleave="blurPopover"
          >
            {{ userMap[row.creatorId].nickname }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" :width="160" :formatter="timeFormatter" />

      <el-table-column label="修改人" width="100px">
        <template #default="{ row }">
          <el-tag
            v-if="userMap[row.updaterId]"
            disable-transitions
            @pointerenter="(ev: PointerEvent) => setPopoverTarget(ev, userMap[row.updaterId])"
            @pointerleave="blurPopover"
          >
            {{ userMap[row.updaterId].nickname }}
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
