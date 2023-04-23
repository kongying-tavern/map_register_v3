<script lang="ts" setup>
import { CoffeeCup, Filter, Grid, List, Location, MapLocation, Operation, SetUp, Setting } from '@element-plus/icons-vue'
import type { FeatureOption } from '../FeatureGrid'
import { useCurrentLayerMarkers, useMap } from '@/pages/pageMapV2/hooks'
import { FeatureGrid, MarkerFilter, MarkerTable, SiderMenu, SiderMenuItem } from '@/pages/pageMapV2/components'
import { AppSettings, AppUserInfo, GSSwitch } from '@/components'
import { useGlobalDialog } from '@/hooks'
import { useUserStore } from '@/stores'
import { FALLBACK_AVATAR_URL } from '@/shared/constant'

defineProps<{
  collapse: boolean
}>()

defineEmits<{
  (e: 'update:collapse', v: boolean): void
}>()

const { showBorder, showTag, showTooltip } = useMap()
const { DialogService } = useGlobalDialog()
const userStore = useUserStore()
const router = useRouter()

const tabName = ref('filter')

const openUserInfoDialog = () => DialogService
  .config({
    showClose: false,
    alignCenter: true,
    width: 'fit-content',
    class: 'bg-transparent',
  })
  .open(AppUserInfo)

const openSettingDialog = () => DialogService
  .config({
    title: '设置界面',
    alignCenter: true,
    width: 'fit-content',
  })
  .open(AppSettings)

const features: FeatureOption[] = [
  { label: '管理页', value: 'manager', icon: SetUp },
  { label: '地图V1', value: 'mapV1', icon: Location },
  { label: '地图V2', value: 'mapV2', icon: MapLocation },
  { label: '系统设置', value: 'setting', icon: Setting },
  { label: '赞助我们', value: 'sponsor', icon: CoffeeCup },
]

const onFeatureCommand = (command: string) => ({
  manager: () => router.push('/items'),
  mapV1: () => router.push('/map'),
  mapV2: () => router.push('/map-v2'),
  setting: openSettingDialog,
  sponsor: () => window.open('https://opencollective.com/genshinmap'),
} as Record<string, () => void>)[command]?.()

const { markers } = useCurrentLayerMarkers()
</script>

<template>
  <SiderMenu v-model="tabName" :collapse="collapse" @update:collapse="v => $emit('update:collapse', v)">
    <SiderMenuItem label="个人中心" @click="openUserInfoDialog">
      <template #icon>
        <el-avatar
          shape="circle"
          :size="38"
          :src="userStore.info.logoUrl || FALLBACK_AVATAR_URL"
        />
      </template>
    </SiderMenuItem>

    <SiderMenuItem name="filter" label="点位筛选">
      <template #icon>
        <el-icon :size="38" color="var(--icon-color)" class="relative">
          <Filter />
          <div
            v-show="markers.length > 0"
            class="absolute w-fit bottom-0 bg-red-400 text-sm text-white font-mono rounded-full pointer-events-none px-1"
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
        <GSSwitch v-model="showBorder" label="显示图层边界" />
        <GSSwitch v-model="showTooltip" label="显示调试信息" />
      </div>
    </SiderMenuItem>

    <SiderMenuItem name="fetures" label="更多功能" :icon="Grid">
      <FeatureGrid :features="features" @command="onFeatureCommand" />
    </SiderMenuItem>
  </SiderMenu>
</template>
