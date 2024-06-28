<script lang="ts" setup>
import { BottomLeft, Clock } from '@element-plus/icons-vue'
import { useMarkerHistory } from '../../hooks'
import { AddonTeleporter } from '..'
import HistoryViewer from './HistoryViewer.vue'

const addonId = defineModel<string | undefined>('addonId', {
  required: false,
})

const isAddonActived = computed({
  get: () => addonId.value === 'history',
  set: (isActive) => {
    addonId.value = isActive ? 'history' : ''
  },
})

const markerVo = defineModel<API.MarkerVo>('markerVo', {
  required: true,
})

const {
  data,
  current,
  history,
  nextDisabled,
  preDisabled,
  loading,
  nextRecord,
  preRecord,
  refresh,
} = useMarkerHistory(markerVo)

whenever(isAddonActived, refresh, { immediate: true })
</script>

<template>
  <el-button
    :icon="Clock"
    :type="isAddonActived ? 'primary' : 'default'"
    circle
    style="margin-left:0"
    @click="isAddonActived = !isAddonActived"
  />

  <AddonTeleporter :active="isAddonActived">
    <div class="h-full overflow-hidden flex flex-col gap-2">
      <div class="flex-shrink-0 flex items-center">
        <el-button :disabled="loading" :icon="BottomLeft" title="将此记录填充至表单">
          应用记录
        </el-button>

        <div class="flex-1 text-center">
          <div v-if="history">
            {{ new Date(history.updateTime ?? '').toLocaleString() }}
          </div>

          <div v-else class="text-[var(--el-text-secondary)]">
            -N/A-
          </div>
        </div>

        <el-button-group class="flex-shrink-0">
          <el-button style="padding: 0 4px" :disabled="preDisabled" @click="preRecord">
            <div class="flex flex-col items-center text-xs">
              <el-icon>
                <Back />
              </el-icon>
              <div class="scale-90">
                上一更改
              </div>
            </div>
          </el-button>
          <el-button style="padding: 0 4px" :disabled="nextDisabled" @click="nextRecord">
            <div class="flex flex-col items-center text-xs">
              <el-icon>
                <Right />
              </el-icon>
              <div class="scale-90">
                下一更改
              </div>
            </div>
          </el-button>
        </el-button-group>
      </div>

      <div class="flex-1 overflow-hidden">
        <el-scrollbar height="100%">
          <HistoryViewer
            :loading="loading"
            :current="current"
            :history="history"
            :users="data.users"
          />
        </el-scrollbar>
      </div>
    </div>
  </AddonTeleporter>
</template>
