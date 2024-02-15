<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { Filter as IconFilter, StarFilled as IconStarFilled } from '@element-plus/icons-vue'
import { MarkerFilterAdvanced } from '../MarkerFilterAdvanced'
import { MarkerFilterBasic } from '../MarkerFilterBasic'
import { useMarkerFilter } from './hooks'
import { PresetManager } from '.'
import { GSButton } from '@/components'
import { IconSetting } from '@/components/AppIcons'
import { usePreferenceStore } from '@/stores'

const { preference } = storeToRefs(usePreferenceStore())

/** 筛选预设管理器 */
const conditionManagerVisible = ref(false)

const { conditions } = useMarkerFilter()
</script>

<template>
  <div class="marker-filter genshin-text h-full flex flex-col">
    <MarkerFilterAdvanced v-if="preference['markerFilter.setting.filterType'] === 'advanced'">
      <template #prepend>
        <GSButton
          class="flex-1"
          size="small"
          @click="preference['markerFilter.setting.filterType'] = 'basic'"
        >
          <template #icon>
            <el-icon color="var(--gs-color-success)">
              <IconFilter />
            </el-icon>
          </template>
          基础筛选
        </GSButton>
      </template>
      <template #append>
        <GSButton
          class="flex-1"
          size="small"
          @click="conditionManagerVisible = true"
        >
          <template #icon>
            <el-icon color="var(--gs-color-confirm)">
              <IconSetting />
            </el-icon>
          </template>
          管理预设
        </GSButton>
      </template>
    </MarkerFilterAdvanced>
    <MarkerFilterBasic v-else>
      <template #prepend>
        <GSButton
          class="flex-1"
          size="small"
          @click="preference['markerFilter.setting.filterType'] = 'advanced'"
        >
          <template #icon>
            <el-icon color="var(--gs-color-success)">
              <IconStarFilled />
            </el-icon>
          </template>
          高级筛选
        </GSButton>
      </template>
      <template #append>
        <GSButton
          class="flex-1"
          size="small"
          @click="conditionManagerVisible = true"
        >
          <template #icon>
            <el-icon color="var(--gs-color-confirm)">
              <IconSetting />
            </el-icon>
          </template>
          管理预设
        </GSButton>
      </template>
    </MarkerFilterBasic>

    <PresetManager v-model="conditionManagerVisible" :conditions="conditions" />
  </div>
</template>

<style scoped>
.marker-filter {
  width: 350px;
  max-width: calc(100dvw - 72px);
}
</style>
