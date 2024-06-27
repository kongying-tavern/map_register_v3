<script lang="ts" setup>
import { Clock } from '@element-plus/icons-vue'
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

const { currentIndex, data, refresh, preHistory, loading, nextHistory } = useMarkerHistory(markerVo)

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
        <el-button>应用</el-button>

        <div class="flex-1 text-center">
          <div v-if="nextHistory">
            {{ new Date(nextHistory.updateTime ?? '').toLocaleString() }}
          </div>

          <div v-else>
            none
          </div>
        </div>

        <el-button-group class="flex-shrink-0">
          <el-button style="padding: 0 4px" :disabled="currentIndex + 1 >= data.length" @click="currentIndex++">
            <div class="flex flex-col items-center text-xs">
              <el-icon>
                <Back />
              </el-icon>
              <div class="scale-90">
                上一更改
              </div>
            </div>
          </el-button>
          <el-button style="padding: 0 4px" :disabled="currentIndex <= 0" @click="currentIndex--">
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
            :pre-history="preHistory"
            :next-history="nextHistory"
          />
        </el-scrollbar>
      </div>
    </div>
  </AddonTeleporter>
</template>
