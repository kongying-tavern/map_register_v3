<script lang="ts" setup>
import { defineModel } from 'vue'
import { CoffeeCup, Filter, Grid, List, PieChart, Promotion, Setting } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import type { FeatureOption } from '../FeatureGrid'
import { FeatureGrid, MarkerFilter, MarkerTable, SiderMenu, SiderMenuItem } from '@/pages/pageMapV2/components'
import { AppSettings } from '@/components'
import { useGlobalDialog } from '@/hooks'
import { Logger } from '@/utils'
import { useDadianStore, useIconTagStore, useMapStateStore, usePreferenceStore, useUserAuthStore, useUserInfoStore } from '@/stores'
import { IconGithub } from '@/components/AppIcons'
import { FALLBACK_AVATAR_URL } from '@/shared/constant'
import { ExitLeft } from '@/components/GenshinUI/GSIcon'

const collapse = defineModel<boolean>('collapse', { required: true })

const logger = new Logger('[debug]')

const iconTagStore = useIconTagStore()
const userInfoStore = useUserInfoStore()
const userAuthStore = useUserAuthStore()
const mapStateStore = useMapStateStore()
const { preference } = storeToRefs(usePreferenceStore())

const { DialogService } = useGlobalDialog()
const router = useRouter()

const tabName = computed({
  get: () => preference.value['mapSiderMenu.state.tabName'],
  set: (v) => {
    preference.value['mapSiderMenu.state.tabName'] = v
  },
})

const openUserInfoDialog = () => {
  userInfoStore.showUserInfo = true
}

const openSettingDialog = () => DialogService
  .config({
    alignCenter: true,
    width: 'fit-content',
  })
  .open(AppSettings)

const url = ref('')

const openTagSpriteImage = () => {
  logger.info('mapping', iconTagStore.tagPositionMap)
  url.value = iconTagStore.tagSpriteUrl ?? ''
}

const openMarkerSpriteImage = () => {
  logger.info('mapping', iconTagStore.markerSpriteMapping)
  url.value = iconTagStore.markerSpriteUrl ?? ''
}

const features: FeatureOption[] = [
  { label: '赞助我们', icon: CoffeeCup, cb: () => window.open('https://opencollective.com/genshinmap') },
  { label: 'GitHub', icon: IconGithub, cb: () => window.open('https://github.com/kongying-tavern/map_register_v3') },
  { label: '检查订阅配置', icon: Promotion, cb: () => logger.info(JSON.parse(JSON.stringify(useDadianStore()._raw))) },
  { label: '检查预渲染图', icon: Promotion, cb: openTagSpriteImage },
  { label: '预渲染点位图', icon: Promotion, cb: openMarkerSpriteImage },
]
</script>

<template>
  <SiderMenu v-model="tabName" v-model:collapse="collapse">
    <SiderMenuItem label="个人中心" @click="openUserInfoDialog">
      <template #icon>
        <el-avatar
          shape="circle"
          class="select-none"
          :size="38"
          :src="userInfoStore.info.logo || FALLBACK_AVATAR_URL"
        />
      </template>
    </SiderMenuItem>

    <SiderMenuItem name="filter" label="点位筛选">
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
            v-show="mapStateStore.markersFilterLoading || mapStateStore.currentLayerMarkers.length > 0"
            class="absolute left-1/2 bottom-1 -translate-x-1/2 w-fit h-5 rounded-full p-0.5 grid place-items-center"
            :class="[mapStateStore.markersFilterLoading ? 'bg-[#FFBB28]' : 'bg-[#68B11E]']"
          >
            <el-icon
              v-if="mapStateStore.markersFilterLoading"
              class="is-loading"
              color="white"
              :size="16"
            >
              <Loading />
            </el-icon>

            <span v-else class="text-xs leading-none px-0.5 text-white">
              {{ mapStateStore.currentLayerMarkers.length }}
            </span>
          </div>
        </div>
      </template>
      <MarkerFilter />
    </SiderMenuItem>

    <SiderMenuItem name="marker-table" label="点位列表" :icon="List">
      <MarkerTable />
    </SiderMenuItem>

    <SiderMenuItem label="系统设置" :icon="Setting" @click="openSettingDialog" />

    <SiderMenuItem
      v-if="userInfoStore.isManager"
      label="管理面板"
      :icon="PieChart"
      @click="() => router.push('/items')"
    />

    <SiderMenuItem name="fetures" label="更多功能" :icon="Grid">
      <FeatureGrid :features="features" />
    </SiderMenuItem>

    <el-image-viewer v-if="url" :url-list="[url]" @close="url = ''" />

    <template #footer>
      <SiderMenuItem label="退出" :icon="ExitLeft" @click="userAuthStore.logout" />
    </template>
  </SiderMenu>
</template>
