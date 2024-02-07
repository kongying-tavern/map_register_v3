<script lang="ts" setup>
import MarkerBasicFilter from './MarkerBasicFilter.vue'
import { useMarkerFilter } from './hooks'
import { PresetManager } from '.'
import { GSButton } from '@/components'
import { IconSetting } from '@/components/AppIcons'

/** 筛选预设管理器 */
const conditionManagerVisible = ref(false)

const { conditions } = useMarkerFilter()
</script>

<template>
  <div class="marker-filter genshin-text h-full flex flex-col">
    <MarkerBasicFilter>
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
    </MarkerBasicFilter>

    <PresetManager v-model="conditionManagerVisible" :conditions="conditions" />
  </div>
</template>

<style scoped>
.marker-filter {
  width: 350px;
  max-width: calc(100dvw - 72px);
}
</style>
