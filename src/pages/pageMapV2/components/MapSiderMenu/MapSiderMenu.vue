<script lang="ts" setup>
import { CoffeeCup, Filter, Grid, IceTea, List, Operation, PieChart, Promotion, Setting } from '@element-plus/icons-vue'
import { ElImage } from 'element-plus'
import type { FeatureOption } from '../FeatureGrid'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { FeatureGrid, MarkerFilter, MarkerTable, SiderMenu, SiderMenuItem } from '@/pages/pageMapV2/components'
import { AppSettings, GSSwitch } from '@/components'
import { useGlobalDialog } from '@/hooks'
import { Logger } from '@/utils'
import { useDadianStore, useMapSettingStore, useUserStore } from '@/stores'
import { IconGithub } from '@/components/AppIcons'
import { FALLBACK_AVATAR_URL } from '@/shared/constant'
import { ExitLeft } from '@/components/GenshinUI/GSIcon'
import { vAdmin } from '@/directives'

defineProps<{
  collapse: boolean
}>()

defineEmits<{
  (e: 'update:collapse', v: boolean): void
}>()

const logger = new Logger('[debug]')

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

const conditionManager = useCondition()
const openSpiritImage = () => DialogService
  .config({
    width: 'fit-content',
  })
  .props({
    src: conditionManager.spiritImage,
    fit: 'contain',
    previewTeleported: true,
    previewSrcList: [conditionManager.spiritImage],
    style: {
      'vertical-align': 'middle',
    },
  })
  .open(ElImage)

const features: FeatureOption[] = [
  { label: '赞助我们', icon: CoffeeCup, cb: () => window.open('https://opencollective.com/genshinmap') },
  { label: 'GitHub', icon: IconGithub, cb: () => window.open('https://github.com/kongying-tavern/map_register_v3') },
  { label: '检查精灵图', icon: IceTea, cb: openSpiritImage },
  { label: '检查订阅配置', icon: Promotion, cb: () => logger.info(JSON.parse(JSON.stringify(useDadianStore()._raw))) },
]

const mapSettingStore = useMapSettingStore()
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
            v-show="conditionManager.markers.length > 0"
            class="absolute w-fit bottom-0 bg-red-400 text-sm text-white font-mono rounded-full pointer-events-none px-1 select-none"
          >
            {{ conditionManager.markers.length }}
          </div>
        </el-icon>
      </template>
      <MarkerFilter />
    </SiderMenuItem>

    <SiderMenuItem name="marker-table" label="点位列表" :icon="List">
      <MarkerTable />
    </SiderMenuItem>

    <SiderMenuItem name="layer" label="图层设置" :icon="Operation">
      <div class="h-full flex flex-col gap-2 p-4">
        <GSSwitch v-model="mapSettingStore.showTag" label="显示地图标签" />
        <GSSwitch v-model="mapSettingStore.showOverlay" label="显示附加图层" />
        <GSSwitch v-model="mapSettingStore.showOverlayMask" label="显示附加图层蒙层" />
        <GSSwitch v-model="mapSettingStore.showOverlayController" label="显示附加图层控制器" />
        <GSSwitch v-model="mapSettingStore.showOverlayControllerBounds" label="显示附加图层控制器区域" />
        <GSSwitch v-model="mapSettingStore.hideMarkedMarker" label="隐藏标记点位" />
        <GSSwitch v-model="mapSettingStore.showBorder" label="显示图层边界" />
        <GSSwitch v-model="mapSettingStore.showTooltip" label="显示调试信息" />
      </div>
    </SiderMenuItem>

    <SiderMenuItem label="系统设置" :icon="Setting" @click="openSettingDialog" />

    <SiderMenuItem v-admin label="管理面板" :icon="PieChart" @click="() => router.push('/items')" />

    <SiderMenuItem name="fetures" label="更多功能" :icon="Grid">
      <FeatureGrid :features="features" />
    </SiderMenuItem>

    <template #footer>
      <SiderMenuItem label="退出" :icon="ExitLeft" @click="userStore.logout" />
    </template>
  </SiderMenu>
</template>
