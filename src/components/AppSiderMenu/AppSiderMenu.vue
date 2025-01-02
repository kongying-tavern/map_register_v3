<script lang="ts" setup>
import { computed } from 'vue'
import { Box, ChatLineRound, CoffeeCup, Coordinate, Filter, FolderOpened, Grid, List, Location, Memo, Picture, Promotion, Setting, Star, User } from '@element-plus/icons-vue'
import type { FeatureGroupOption } from './components'
import { CollapseButton, FeatureGrid, MarkerFilter, MarkerTable, SiderMenu, SiderMenuItem } from './components'
import { AppSettings, AppWindowTeleporter, useAppWindow } from '@/components'
import { useGlobalDialog } from '@/hooks'
import { Logger } from '@/utils'
import {
  useDadianStore,
  useIconTagStore,
  useMapStateStore,
  useNoticeStore,
  usePreferenceStore,
  useTileStore,
} from '@/stores'
import { IconGithub, IconNotice } from '@/components/AppIcons'

const collapse = ref(true)

const logger = new Logger('侧边栏')

const iconTagStore = useIconTagStore()
const mapStateStore = useMapStateStore()
const noticeStore = useNoticeStore()
const preferenceStore = usePreferenceStore()

const { DialogService } = useGlobalDialog()

const { info: itemManagerInfo, open: openItemManager } = useAppWindow({
  name: '物品管理',
  minWidth: 887,
  minHeight: 500,
})

const { info: areaManagerInfo, open: openAreaManager } = useAppWindow({
  name: '地区管理',
  minWidth: 887,
  minHeight: 500,
})

const { info: markerManagerInfo, open: openMarkerManager } = useAppWindow({
  name: '点位管理',
  minWidth: 887,
  minHeight: 500,
})

const { info: typeManagerInfo, open: openTypeManager } = useAppWindow({
  name: '类型管理',
  minWidth: 887,
  minHeight: 500,
})

const { info: iconManagerInfo, open: openIconManager } = useAppWindow({
  name: '图标管理',
  minWidth: 887,
  minHeight: 500,
})

const { info: noticeManagerInfo, open: openNoticeManager } = useAppWindow({
  name: '公告管理',
  minWidth: 887,
  minHeight: 500,
})

const { info: scoreManagerInfo, open: openScoreManager } = useAppWindow({
  name: '用户评分',
  minWidth: 887,
  minHeight: 500,
})

const { info: userManagerInfo, open: openUserManager } = useAppWindow({
  name: '用户管理',
  minWidth: 887,
  minHeight: 500,
})

const { info: historyManagerInfo, open: openHistoryManager } = useAppWindow({
  name: '操作记录',
  minWidth: 887,
  minHeight: 500,
})

const AreaManager = defineAsyncComponent(() => import('@/pages/pageAreaManager/AreaManager.vue'))
const ItemManager = defineAsyncComponent(() => import('@/pages/pageItemManager/ItemManager.vue'))
const MarkerManager = defineAsyncComponent(() => import('@/pages/pageMarkerManager/MarkerManager.vue'))
const TypeManager  = defineAsyncComponent(() => import('@/pages/pageTypeManager/TypeManager.vue'))
const IconManager = defineAsyncComponent(() => import('@/pages/pageIconManager/IconManager.vue'))
const NoticeManager = defineAsyncComponent(() => import('@/pages/pageNoticeManager/PageNoticeManager.vue'))
const ScoreManager = defineAsyncComponent(() => import('@/pages/pageScoreManager/ScoreManager.vue'))
const UserManager = defineAsyncComponent(() => import('@/pages/pageUserManager/UserManager.vue'))
const HistoryManager = defineAsyncComponent(() => import('@/pages/pageHistory/PageHistory.vue'))

const openSettingDialog = () => DialogService
  .config({
    alignCenter: true,
    width: 'fit-content',
  })
  .open(AppSettings)

const url = ref('')

const openTagSpriteImage = () => {
  logger.info('icontag mapping', iconTagStore.tagPositionMap)
  url.value = iconTagStore.tagSpriteUrl ?? ''
}

const openMarkerSpriteImage = () => {
  logger.info('marker mapping', iconTagStore.markerSpriteMapping)
  url.value = iconTagStore.markerSpriteUrl ?? ''
}

const features: FeatureGroupOption[] = [
  {
    label: '管理系统',
    items: [
      { label: '物品管理', role: 'MANAGER_COMPONENT', icon: Box, cb: () => openItemManager() },
      { label: '地区管理', role: 'MANAGER_COMPONENT', icon: Coordinate, cb: () => openAreaManager() },
      { label: '点位管理', role: 'MANAGER_COMPONENT', icon: Location, cb: () => openMarkerManager() },
      { label: '类型管理', role: 'MANAGER_COMPONENT', icon: FolderOpened, cb: () => openTypeManager() },
      { label: '图标管理', role: 'MANAGER_COMPONENT', icon: Picture, cb: () => openIconManager() },
      { label: '公告管理', role: 'MANAGER_COMPONENT', icon: ChatLineRound, cb: () => openNoticeManager() },
      { label: '用户评分', role: 'MANAGER_COMPONENT', icon: Star, cb: () => openScoreManager() },
      { label: '用户管理', role: 'ADMIN_COMPONENT', icon: User, cb: () => openUserManager() },
      { label: '操作记录', role: 'ADMIN_COMPONENT', icon: Memo, cb: () => openHistoryManager() },
    ],
  },
  {
    label: '开发者',
    items: [
      { label: '检查订阅配置', icon: Promotion, cb: () => logger.info(JSON.parse(JSON.stringify(useDadianStore().raw))) },
      { label: '检查底图配置', icon: Promotion, cb: () => logger.info(JSON.parse(JSON.stringify(useTileStore().mergedTileConfigs))) },
      { label: '检查预渲染图', icon: Promotion, cb: openTagSpriteImage },
      { label: '预渲染点位图', icon: Promotion, cb: openMarkerSpriteImage },
    ],
  },
  {
    label: '其他',
    items: [
      { label: '赞助我们', icon: CoffeeCup, cb: () => window.open('https://opencollective.com/genshinmap') },
      { label: 'GitHub', icon: IconGithub, cb: () => window.open('https://github.com/kongying-tavern/map_register_v3') },
    ],
  },
]

/**
 * --------------------------------------------------
 * 过滤器相关
 * --------------------------------------------------
 */
const isAdvancedFilter = computed(() => preferenceStore.filterType === 'advanced')

const switchFilterMode = () => {
  if (isAdvancedFilter.value)
    preferenceStore.filterType = 'basic'
  else
    preferenceStore.filterType = 'advanced'
}
</script>

<template>
  <CollapseButton v-model:collapse="collapse" />

  <SiderMenu v-model="preferenceStore.tabName" v-model:collapse="collapse">
    <AppWindowTeleporter :info="areaManagerInfo">
      <AreaManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="itemManagerInfo">
      <ItemManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="iconManagerInfo">
      <IconManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="markerManagerInfo">
      <MarkerManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="typeManagerInfo">
      <TypeManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="iconManagerInfo">
      <IconManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="noticeManagerInfo">
      <NoticeManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="scoreManagerInfo">
      <ScoreManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="userManagerInfo">
      <UserManager />
    </AppWindowTeleporter>

    <AppWindowTeleporter :info="historyManagerInfo">
      <HistoryManager />
    </AppWindowTeleporter>

    <SiderMenuItem name="filter" :label="isAdvancedFilter ? '高级筛选' : '基础筛选'">
      <template #icon>
        <div class="w-full h-full overflow-hidden select-none">
          <el-icon
            class="left-0 top-0"
            color="var(--icon-color)"
            :size="38"
          >
            <Filter />
          </el-icon>

          <div
            class="
              absolute right-0 bottom-0 rounded-full px-1.5 py-0.2
              align-middle leading-snug text-sm font-bold
              -translate-x-[-2px] -translate-y-[-2px]
              hover:outline hover:outline-2 hover:outline-gray-200
              cursor-pointer
            "
            :class="[isAdvancedFilter ? 'bg-[#806BA7]' : 'bg-[#68B11E]']"
            @click="switchFilterMode()"
          >
            {{ isAdvancedFilter ? 'Pro' : 'Base' }}
          </div>
        </div>
      </template>

      <MarkerFilter />
    </SiderMenuItem>

    <SiderMenuItem name="marker-table" label="点位列表">
      <template #icon>
        <div class="w-full h-full overflow-hidden select-none">
          <el-icon
            class="left-0 top-0"
            color="var(--icon-color)"
            :size="38"
          >
            <List />
          </el-icon>

          <div
            v-show="mapStateStore.markersFilterLoading || mapStateStore.currentLayerMarkers.length > 0"
            class="absolute left-1/2 bottom-1 -translate-x-1/2 w-fit h-5 rounded-full p-0.5 grid place-items-center bg-[#68B11E]"
          >
            <span class="text-xs leading-none px-0.5 text-white">
              {{ mapStateStore.currentLayerMarkers.length }}
            </span>
          </div>
        </div>
      </template>
      <MarkerTable />
    </SiderMenuItem>

    <SiderMenuItem name="features" label="更多功能" :icon="Grid">
      <FeatureGrid :features="features" />
    </SiderMenuItem>

    <el-image-viewer v-if="url" :url-list="[url]" @close="url = ''" />

    <template #footer>
      <SiderMenuItem label="公告" :icon="IconNotice" @click="noticeStore.show">
        <template #icon="{ color }">
          <el-icon :color="color" :size="38">
            <IconNotice />
          </el-icon>

          <div
            v-if="noticeStore.newCount > 0"
            class="
              absolute top-0 right-0 h-[18px] w-[18px] rounded-full grid place-content-center
              text-xs text-white
              bg-[#E6455F]
              font-[HYWenHei-85W]
            "
          >
            {{ noticeStore.newCount }}
          </div>
        </template>
      </SiderMenuItem>

      <SiderMenuItem label="系统设置" :icon="Setting" @click="openSettingDialog" />
    </template>
  </SiderMenu>
</template>
