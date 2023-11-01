<script setup lang="ts">
import { Loading, Search } from '@element-plus/icons-vue'
import { PgUnit, useFetchHook, usePagination } from '@/hooks'
import Api from '@/api/api'

const modelValue = defineModel<API.IconVo | null>('modelValue', {
  default: null,
})

const iconList = ref<API.IconVo[]>([])

const iconQuery = ref('')

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
  init: {
    pageSize: 25,
    total: 0,
    current: 1,
  },
})

const { loading, refresh: updateIconList, onSuccess } = useFetchHook({
  immediate: true,
  onRequest: async () => {
    const { data: { record = [], total = 0 } = {} } = await Api.icon.listIcon({
      current: pagination.value.current,
      size: pagination.value.pageSize,
      name: iconQuery.value,
    })
    return { record, total }
  },
})

watchDebounced(iconQuery, updateIconList, { debounce: 500 })

onSuccess(({ record, total }) => {
  iconList.value = record
  pagination.value.total = total
})
</script>

<template>
  <div class="h-full grid gap-2 grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto]">
    <el-input v-model="iconQuery" placeholder="搜索名称..." class="col-span-2">
      <template #suffix>
        <el-icon :class="{ 'is-loading': loading }">
          <Loading v-if="loading" />
          <Search v-else />
        </el-icon>
      </template>
    </el-input>

    <div
      v-loading="loading"
      element-loading-text="加载中..."
      element-loading-background="var(--el-mask-color)"
      class="w-[256px] flex place-content-center justify-evenly content-evenly flex-wrap overflow-hidden border border-[var(--el-border-color)]"
    >
      <div
        v-for="icon in iconList"
        :key="icon.id"
        class="icon-radio w-[48px] h-[48px] flex-shrink-0 p-1"
        :class="{
          actived: modelValue?.id === icon.id,
        }"
        @click="modelValue = icon"
      >
        <img :src="icon.url" class="w-full h-full object-contain" draggable="false" crossorigin="">
      </div>
    </div>

    <div class="h-full flex flex-col justify-between">
      <el-divider style="margin: 0 0 8px" />
      <div class="text-xs text-center h-[23px] grid place-items-center">
        {{ modelValue ? modelValue.name : '<选择图标>' }}
      </div>
      <el-divider style="margin: 8px 0 0" />

      <div class="flex-1 grid place-items-center place-content-center gap-1">
        <div class="w-16 h-16 border border-[var(--el-border-color)] box-content">
          <img v-if="modelValue" :src="modelValue.url" class="w-full h-full object-contain" draggable="false" crossorigin="">
        </div>
        <div class="text-xs">
          64x64 px
        </div>
      </div>
    </div>

    <el-pagination
      v-model:current-page="pagination.current"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :pager-count="5"
      :layout="layout"
      background
      small
      class="flex justify-end col-span-2"
      @current-change="updateIconList"
    >
      <div>{{ pagination.current }} / {{ Math.ceil(pagination.total / pagination.pageSize) }}</div>
    </el-pagination>
  </div>
</template>

<style scoped>
.icon-radio {
  &:not(.actived):hover {
    background: var(--el-color-primary-light-7);
  }
  &:not(.actived):active {
    background: var(--el-color-primary-light-5);
  }
  &.actived {
    background: var(--el-color-primary);
  }
}
</style>
