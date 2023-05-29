<script lang="ts" setup>
import { CoffeeCup, Filter, Grid, List, Operation, RemoveFilled, SetUp, Setting } from '@element-plus/icons-vue'
import type { FeatureOption } from '../FeatureGrid'
import { useCurrentLayerMarkers, useMapState } from '@/pages/pageMapV2/hooks'
import { FeatureGrid, MarkerFilter, MarkerTable, SiderMenu, SiderMenuItem } from '@/pages/pageMapV2/components'
import { AppSettings, GSSwitch } from '@/components'
import { useGlobalDialog } from '@/hooks'
import { useUserStore } from '@/stores'
import { FALLBACK_AVATAR_URL } from '@/shared/constant'

defineProps<{
  collapse: boolean
}>()

defineEmits<{
  (e: 'update:collapse', v: boolean): void
}>()

const { DialogService } = useGlobalDialog()
const userStore = useUserStore()
const router = useRouter()

const tabName = ref('filter')

const openUserInfoDialog = () => {
  userStore.showUserInfo = true
}

const openSettingDialog = () => DialogService
  .config({
    title: '系统设置',
    alignCenter: true,
    width: 'fit-content',
  })
  .open(AppSettings)

const features: FeatureOption[] = [
  { label: '管理页', value: 'manager', icon: SetUp },
  { label: '系统设置', value: 'setting', icon: Setting },
  { label: '赞助我们', value: 'sponsor', icon: CoffeeCup },
]

const onFeatureCommand = (command: string) => ({
  manager: () => router.push('/items'),
  setting: openSettingDialog,
  sponsor: () => window.open('https://opencollective.com/genshinmap'),
} as Record<string, () => void>)[command]?.()

const { markers } = useCurrentLayerMarkers()

const { maxCacheTileSize, showBorder, showTag, showTooltip, showOverlay } = useMapState()
const cacheTiles = computed({
  get: () => maxCacheTileSize.value !== undefined,
  set: (v) => {
    maxCacheTileSize.value = v ? Number.MAX_SAFE_INTEGER : undefined
  },
})
</script>

<template>
  <SiderMenu v-model="tabName" :collapse="collapse" @update:collapse="v => $emit('update:collapse', v)">
    <SiderMenuItem label="个人中心" @click="openUserInfoDialog">
      <template #icon>
        <el-avatar
          shape="circle"
          class="select-none"
          :size="38"
          :src="userStore.info.logo || FALLBACK_AVATAR_URL"
        />
      </template>
    </SiderMenuItem>

    <SiderMenuItem name="filter" label="点位筛选">
      <template #icon>
        <el-icon :size="38" color="var(--icon-color)" class="relative">
          <Filter />
          <div
            v-show="markers.length > 0"
            class="absolute w-fit bottom-0 bg-red-400 text-sm text-white font-mono rounded-full pointer-events-none px-1 select-none"
          >
            {{ markers.length }}
          </div>
        </el-icon>
      </template>
      <MarkerFilter />
    </SiderMenuItem>

    <SiderMenuItem name="marker-table" label="点位列表" :icon="List">
      <MarkerTable />
    </SiderMenuItem>

    <SiderMenuItem name="setting" label="图层设置" :icon="Operation">
      <div class="h-full flex flex-col gap-2 p-4">
        <GSSwitch v-model="showTag" label="显示地图标签" />
        <GSSwitch v-model="showOverlay" label="显示附加图层" />
        <GSSwitch v-model="showBorder" label="显示图层边界" />
        <GSSwitch v-model="showTooltip" label="显示调试信息" />
        <GSSwitch v-model="cacheTiles" :label="`地图缓存-${cacheTiles ? '最大' : '自动'}`" title="内存低于8G的用户不建议勾选此项" />
      </div>
    </SiderMenuItem>

    <SiderMenuItem name="fetures" label="更多功能" :icon="Grid">
      <FeatureGrid :features="features" @command="onFeatureCommand" />
    </SiderMenuItem>

    <SiderMenuItem label="退出" @click="userStore.logout">
      <template #icon>
        <el-icon color="var(--gs-color-danger)" :size="38">
          <RemoveFilled />
        </el-icon>
      </template>
    </SiderMenuItem>
  </SiderMenu>
</template>
