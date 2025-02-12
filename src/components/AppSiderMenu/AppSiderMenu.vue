<script lang="ts" setup>
import { Box, ChatLineRound, CoffeeCup, Coordinate, Filter, FolderOpened, Grid, List, Location, Memo, Picture, Promotion, Setting, Star, User } from '@element-plus/icons-vue'
import type { FeatureGroupOption } from './components'
import { CollapseButton, FeatureGrid, MarkerFilter, MarkerTable, SiderMenu, SiderMenuItem } from './components'
import { AppSettings, AppWindowTeleporter, useAppWindow, type WindowContextHookReturnType } from '@/components'
import { useGlobalDialog } from '@/hooks'
import { Logger } from '@/utils'
import {
  ACCESS_BINARY_MASK,
  useAccessStore,
  useDadianStore,
  useIconTagStore,
  useMapStateStore,
  useNoticeStore,
  usePreferenceStore,
  useTileStore,
} from '@/stores'
import { IconGithub, IconNotice } from '@/components/AppIcons'

interface ManagerModuleOption {
  name: string
  hook: WindowContextHookReturnType
  icon: Component
  comp: Component
  role: keyof typeof ACCESS_BINARY_MASK
}

const collapse = ref(true)

const logger = new Logger('侧边栏')

const accessStore = useAccessStore()
const iconTagStore = useIconTagStore()
const mapStateStore = useMapStateStore()
const noticeStore = useNoticeStore()
const preferenceStore = usePreferenceStore()

const { DialogService } = useGlobalDialog()

const windowList: ManagerModuleOption[] = [
  {
    name: '物品管理',
    hook: useAppWindow({ name: '物品管理', minWidth: 887, minHeight: 500, center: true }),
    icon: Box,
    comp: defineAsyncComponent(() => import('@/pages/pageItemManager/ItemManager.vue')),
    role:  'MANAGER_COMPONENT',
  },
  {
    name: '地区管理',
    hook: useAppWindow({ name: '地区管理', minWidth: 887, minHeight: 500, center: true }),
    icon: Coordinate,
    comp: defineAsyncComponent(() => import('@/pages/pageAreaManager/AreaManager.vue')),
    role:  'MANAGER_COMPONENT',
  },
  {
    name: '点位管理',
    hook: useAppWindow({ name: '点位管理', minWidth: 887, minHeight: 500, center: true }),
    icon: Location,
    comp: defineAsyncComponent(() => import('@/pages/pageMarkerManager/MarkerManager.vue')),
    role:  'MANAGER_COMPONENT',
  },
  {
    name: '类型管理',
    hook: useAppWindow({ name: '类型管理', minWidth: 887, minHeight: 500, center: true }),
    icon: FolderOpened,
    comp: defineAsyncComponent(() => import('@/pages/pageTypeManager/TypeManager.vue')),
    role:  'MANAGER_COMPONENT',
  },
  {
    name: '图标管理',
    hook: useAppWindow({ name: '图标管理', minWidth: 887, minHeight: 500, center: true }),
    icon: Picture,
    comp: defineAsyncComponent(() => import('@/pages/pageIconManager/IconManager.vue')),
    role:  'MANAGER_COMPONENT',
  },
  {
    name: '公告管理',
    hook: useAppWindow({ name: '公告管理', minWidth: 887, minHeight: 500, center: true }),
    icon: ChatLineRound,
    comp: defineAsyncComponent(() => import('@/pages/pageNoticeManager/PageNoticeManager.vue')),
    role:  'MANAGER_COMPONENT',
  },
  {
    name: '用户统计',
    hook: useAppWindow({ name: '用户统计', minWidth: 887, minHeight: 500, center: true }),
    icon: Star,
    comp: defineAsyncComponent(() => import('@/pages/pageContribution/PageContribution.vue')),
    role:  'ADMIN_COMPONENT',
  },
  {
    name: '用户管理',
    hook: useAppWindow({ name: '用户管理', minWidth: 887, minHeight: 500, center: true }),
    icon: User,
    comp: defineAsyncComponent(() => import('@/pages/pageUserManager/UserManager.vue')),
    role:  'ADMIN_COMPONENT',
  },
  {
    name: '历史记录',
    hook: useAppWindow({ name: '历史记录', minWidth: 887, minHeight: 500, center: true }),
    icon: Memo,
    comp: defineAsyncComponent(() => import('@/pages/pageHistory/PageHistory.vue')),
    role:  'MANAGER_COMPONENT',
  },
]

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

const features = shallowRef<FeatureGroupOption[]>([
  {
    label: '管理系统',
    items: windowList.map(({ name, hook, icon, role }) => ({ label: name, icon, cb: hook.open, role })),
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
])

const featuresWithRole = computed(() => features.value.reduce((seed, featureGroup) => {
  const groupItems = featureGroup.items.filter(({ role }) => {
    if (!role)
      return true
    return accessStore.get(role)
  })
  if (groupItems.length > 0)
    seed.push({ label: featureGroup.label, items: groupItems })
  return seed
}, [] as FeatureGroupOption[]))

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
    <template v-for="appWindow in windowList" :key="appWindow.name">
      <AppWindowTeleporter
        v-if="accessStore.get(appWindow.role)"
        :info="appWindow.hook.info.value"
      >
        <component :is="appWindow.comp" />
      </AppWindowTeleporter>
    </template>

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
      <FeatureGrid :features="featuresWithRole" />
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
