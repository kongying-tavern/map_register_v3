<script lang="ts" setup>
import { Close, Coin, Expand, MapLocation, Monitor, Moon, Star, Sunny, TurnOff } from '@element-plus/icons-vue'
import {
  ModuleAbout,
  ModuleDashboard,
  ModuleDatabase,
  ModuleDeveloper,
  ModuleMapSetting,
} from './modules'
import { usePreferenceStore } from '@/stores'
import { GlobalDialogController, useTheme } from '@/hooks'

const { isDark } = useTheme()
const preferenceStore = usePreferenceStore()

const settingOptions: { key: string; name: string; is: Component; icon?: Component }[] = [
  { key: 'dashboard', name: '基本信息', is: ModuleDashboard, icon: Monitor },
  { key: 'mapsetting', name: '地图', is: ModuleMapSetting, icon: MapLocation },
  { key: 'database', name: '数据库', is: ModuleDatabase, icon: Coin },
  { key: 'developer', name: '开发者', is: ModuleDeveloper, icon: TurnOff },
  { key: 'about', name: '关于空荧后厨', is: ModuleAbout, icon: Star },
]

const activedKey = computed({
  get: () => preferenceStore.preference['settingPanel.state.activedKey'] ?? settingOptions[0].key,
  set: (v) => {
    preferenceStore.preference['settingPanel.state.activedKey'] = v
  },
})

const show = ref(false)

const contentRef = ref<HTMLElement>()
</script>

<template>
  <div
    class="
      w-[800px] h-[600px] overflow-hidden
      max-w-[100dvw] max-h-[100dvh]
      flex flex-col
      bg-[var(--el-bg-color)]
      transition-[background-color,width]
      rounded
      text-[var(--el-text-color-primary)]
    "
  >
    <div class="h-9 flex justify-between items-center p-0.5 mb-2">
      <div class="flex items-center gap-1">
        <span class="hidden max-[800px]:flex">
          <el-button text :icon="Expand" @click="show = !show" />
        </span>
        <span class="leading-9 px-2">设置</span>
        <el-switch
          v-model="isDark"
          :active-action-icon="Moon"
          :inactive-action-icon="Sunny"
          style="
            --el-switch-on-color: var(--el-fill-color-darker);
          "
        />
      </div>
      <div>
        <el-button
          text
          type="danger"
          style="--el-fill-color-light: var(--el-color-danger-light-7); --el-fill-color: var(--el-color-danger-light-9);"
          :icon="Close"
          @click="GlobalDialogController.close"
        />
      </div>
    </div>

    <div class="relative flex-1 flex overflow-hidden" @click="show && (show = false)">
      <div class="overflow-visible transition-[width] max-[800px]:w-0 w-[150px]" @click.stop="">
        <div
          class="
            w-[150px] h-full flex flex-col px-2
            absolute left-0
            bg-[var(--el-bg-color)]
            translate-x-0
            transition-[background-color,transform]
            z-10
          "
          :class="[show ? '' : 'max-[800px]:-translate-x-full']"
        >
          <div
            v-for="setting in settingOptions"
            :key="setting.key"
            class="py-0.5 text-sm overflow-hidden group cursor-pointer"
            @click="activedKey = setting.key"
          >
            <div
              class="px-2 py-1 w-full h-8 overflow-hidden flex items-center gap-2 transition-[color,background-color] rounded"
              :class="activedKey === setting.key
                ? 'bg-[var(--el-color-primary-light-9)] text-[var(--el-color-primary)]'
                : 'group-hover:bg-[var(--el-fill-color-light)] group-active:bg-[var(--el-fill-color-darker)]'"
            >
              <el-icon v-if="setting.icon">
                <component :is="setting.icon" />
              </el-icon>
              <span>{{ setting.name }}</span>
            </div>
            <Teleport v-if="contentRef && activedKey === setting.key" :to="contentRef">
              <component :is="setting.is" />
            </Teleport>
          </div>
        </div>
      </div>

      <div
        ref="contentRef"
        class="
          flex-1
          rounded-tl-md
          bg-[var(--el-bg-color)]
          transition-[background-color]
        "
        :class="[show ? 'max-[800px]:pointer-events-none max-[800px]:brightness-[0.4]' : '']"
      />
    </div>
  </div>
</template>
