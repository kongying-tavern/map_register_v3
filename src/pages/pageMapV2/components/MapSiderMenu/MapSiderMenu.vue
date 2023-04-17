<script lang="ts" setup>
import { Filter, Grid, List, Setting } from '@element-plus/icons-vue'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'
import { useMap } from '@/pages/pageMapV2/hooks'
import { MarkerFilter, MarkerTable, SiderMenu, SiderMenuItem } from '@/pages/pageMapV2/components'
import { AppUserAvatar, AppUserInfo } from '@/components'
import { useGlobalDialog } from '@/hooks'

defineProps<{
  collapse: boolean
}>()

defineEmits<{
  (e: 'update:collapse', v: boolean): void
}>()

const { baseLayerCode, showBorder, showTag, showTooltip } = useMap()
const tabName = ref('filter')

const { DialogService } = useGlobalDialog()
const openUserInfoDialog = () => {
  DialogService
    .config({
      showClose: false,
      width: 1200,
      alignCenter: true,
      class: 'bg-transparent',
    })
    .open(AppUserInfo)
}
</script>

<template>
  <SiderMenu v-model="tabName" :collapse="collapse" @update:collapse="v => $emit('update:collapse', v)">
    <SiderMenuItem label="个人中心" @click="openUserInfoDialog">
      <template #icon>
        <el-avatar
          shape="circle"
          :size="38"
          src="https://webstatic.mihoyo.com/upload/contentweb/2022/10/20/62cb7fb1815d9d05d3ece2e0d8e85c7d_8731082942818264376.png"
        />
      </template>
    </SiderMenuItem>

    <SiderMenuItem name="filter" label="筛选" :icon="Filter">
      <MarkerFilter />
    </SiderMenuItem>

    <SiderMenuItem name="marker-table" label="点位列表" :icon="List">
      <MarkerTable />
    </SiderMenuItem>

    <SiderMenuItem name="fetures" label="功能" :icon="Grid">
      <MarkerTable />
    </SiderMenuItem>

    <SiderMenuItem name="setting" label="设置" :icon="Setting">
      <div class="h-full flex flex-col gap-2 p-4">
        <el-select v-model="baseLayerCode">
          <el-option
            v-for="config in LAYER_CONFIGS"
            :key="config.code"
            :label="config.name"
            :value="config.code"
          />
        </el-select>
        <el-switch v-model="showTag" inline-prompt active-text="显示地图标签" inactive-text="隐藏地图标签" />
        <el-switch v-model="showBorder" inline-prompt active-text="显示图层边界" inactive-text="隐藏图层边界" />
        <el-switch v-model="showTooltip" inline-prompt active-text="显示调试信息" inactive-text="隐藏调试信息" />
        <AppUserAvatar />
      </div>
    </SiderMenuItem>
  </SiderMenu>
</template>
