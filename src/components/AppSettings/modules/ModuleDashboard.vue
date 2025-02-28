<script setup lang="ts">
import { useBroadcastStore, useUserStore } from '@/stores'
import { formatByteSize } from '@/utils'
import { Odometer, PictureRounded } from '@element-plus/icons-vue'
import { SettingBar, SettingGroup, SettingPanel } from '../components'

const userStore = useUserStore()
const broadcastStore = useBroadcastStore()

const clients = computed(() => {
  return [...broadcastStore.state.clients.values()].sort(({ time: ta }, { time: tb }) => ta - tb)
})

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

const { state: glInfo } = useAsyncState<{ label: string, value: unknown }[]>(async () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2')
  if (!gl)
    return []
  return [
    'MAX_TEXTURE_SIZE',
    'DEPTH_BITS',
    'MAX_VIEWPORT_DIMS',
    'RENDERER',
    'VENDOR',
    'VERSION',
    'MAX_TEXTURE_IMAGE_UNITS',
    'SHADING_LANGUAGE_VERSION',
  ].map(key => ({
    label: key.replace(/_/g, ' ').toLowerCase(),
    value: gl.getParameter(gl[key as keyof WebGL2RenderingContext] as number),
  }))
}, [])

const storageDetails = computed<{ name: string, percentage: number, text: string }[]>(() => {
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
        <el-avatar class="flex-shrink-0" :src="userStore.info?.logo" :size="100" />
        <div class="flex-1 flex flex-col px-2">
          <span class="text-base">{{ userStore.info?.nickname }}</span>
          <span class="text-xs">UID: {{ userStore.info?.id }}</span>
          <span class="text-xs">{{ userStore.info?.role?.name ?? '未知角色' }}</span>
        </div>
        <pre class="flex-1 h-[100px] text-xs rounded bg-[var(--el-color-primary-light-9)] p-2 overflow-auto">{{ userAgent.match(/\S+\/\S+/g)?.join('\n') }}</pre>
      </div>
    </div>

    <SettingGroup name="设备信息">
      <SettingBar label="WebGL" note="Make Web Great Again!" :icon="PictureRounded">
        <template #detail>
          <el-descriptions
            :border="true"
            :column="3"
            size="small"
            direction="vertical"
          >
            <el-descriptions-item
              v-for="({ label, value }) in glInfo"
              :key="label"
              :label="label"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </SettingBar>

      <SettingBar label="本地存储" note="这包括本地数据库、缓存等" :icon="Odometer">
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
    </SettingGroup>

    <SettingGroup name="页面信息">
      <SettingBar label="页面实例" :note="`当前 ${clients.length} 个页面正在运作中`">
        <template #detail>
          <div class="text-xs">
            <div
              v-for="meta in clients"
              :key="meta.id"
              class="flex justify-between"
            >
              <div :class="{ 'text-[var(--el-color-success)]': meta.id === broadcastStore.meta.id }">
                {{ meta.id }} <span v-if="meta.id === broadcastStore.meta.id">[当前]</span>
              </div>
              <div>
                创建于 {{ new Date(meta.time).toLocaleString() }}
              </div>
            </div>
          </div>
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
