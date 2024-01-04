<script setup lang="ts">
import { Odometer } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { SettingBar, SettingPanel } from '../components'
import { useUserInfoStore } from '@/stores'
import { formatByteSize } from '@/utils'

const { info, userRole } = storeToRefs(useUserInfoStore())

interface StorageEstimateExpand extends StorageEstimate {
  /** 用量详情，目前仅在 chromuim 内核浏览器下可用 */
  usageDetails?: {
    caches: number
    indexedDB: number
    serviceWorkerRegistrations: number
  }
}

const { state: storageEstimate } = useAsyncState<StorageEstimateExpand>(navigator.storage.estimate(), {
  quota: 0,
  usage: 0,
  usageDetails: {
    caches: 0,
    indexedDB: 0,
    serviceWorkerRegistrations: 0,
  },
})

const storageDetails = computed<{ name: string; percentage: number; text: string }[]>(() => {
  if (!storageEstimate.value.usageDetails)
    return []
  const { caches, indexedDB, serviceWorkerRegistrations } = storageEstimate.value.usageDetails
  const totalUsage = storageEstimate.value.usage ?? 0
  const formatTotalUsage = formatByteSize(totalUsage)
  const res = [
    {
      name: '缓存',
      percentage: 100 * caches / totalUsage,
      text: `${formatByteSize(caches)} / ${formatTotalUsage}`,
    },
    {
      name: '数据库',
      percentage: 100 * indexedDB / totalUsage,
      text: `${formatByteSize(indexedDB)} / ${formatTotalUsage}`,
    },
    {
      name: '服务线程',
      percentage: 100 * serviceWorkerRegistrations / totalUsage,
      text: `${formatByteSize(serviceWorkerRegistrations)} / ${formatTotalUsage}`,
    },
  ]
  return res
})

const userAgent = navigator.userAgent
</script>

<template>
  <SettingPanel>
    <div class="pb-4">
      <div class="flex items-center">
        <el-avatar class="flex-shrink-0" :src="info.logo" :size="100" />
        <div class="flex-1 flex flex-col px-2">
          <span class="text-base">{{ info.nickname }}</span>
          <span class="text-xs">UID: {{ info.id }}</span>
          <span class="text-xs">{{ userRole?.name ?? '未知角色' }}</span>
        </div>
        <pre class="flex-1 h-[100px] text-xs rounded bg-[var(--el-color-primary-light-9)] p-2 overflow-auto">{{ userAgent.match(/\S+\/\S+/g)?.join('\n') }}</pre>
      </div>
    </div>

    <SettingBar label="存储" note="这包括本地数据库、缓存等" :icon="Odometer" open>
      <template #setting>
        <div class="grid place-items-center text-xs">
          {{ formatByteSize(storageEstimate.usage ?? 0) }} / {{ formatByteSize(storageEstimate.quota ?? 0) }}
        </div>
      </template>

      <template v-if="storageEstimate.usageDetails" #detail>
        <div class="flex flex-col gap-3" style="--el-border-color-lighter: var(--el-border-color-dark)">
          <div v-for="storageDetail in storageDetails" :key="storageDetail.name" class="flex flex-col gap-1">
            <div class="flex justify-between">
              <div class="text-sm">
                {{ storageDetail.name }}
              </div>
              <div class="text-xs">
                已使用 {{ storageDetail.text }}
              </div>
            </div>
            <el-progress
              :percentage="storageDetail.percentage || 0"
              :stroke-width="12"
              :show-text="false"
            />
          </div>
        </div>
      </template>
    </SettingBar>
  </SettingPanel>
</template>
