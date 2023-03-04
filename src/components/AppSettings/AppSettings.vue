<script lang="ts" setup>
import SettingItem from './SettingItem.vue'
import { localSettings, useItemStore, useMarkerStore } from '@/stores'

/** 计算缓存大小 */
const usageStorage = ref(0)
const quotaStorage = ref(0)
const usagePercentage = computed(() => Math.floor(100 * (usageStorage.value / quotaStorage.value) || 0))
const calculateCaches = async () => {
  const { usage = 0, quota = 0 } = (await navigator.storage.estimate())
  usageStorage.value = usage / (2 ** (10 * 3))
  quotaStorage.value = quota / 10 ** 9
}
calculateCaches()

/** 删除全部缓存 */
const cacheLaoding = ref(false)
const cleatAllCaches = async () => {
  try {
    cacheLaoding.value = true
    const cacheNames = await caches.keys()
    const missions = cacheNames.map(cacheName => caches.delete(cacheName))
    await Promise.all(missions)
    await calculateCaches()
  }
  catch {
    // no action
  }
  finally {
    cacheLaoding.value = false
  }
}

const itemStore = useItemStore()
const markerStore = useMarkerStore()
</script>

<template>
  <div class="setting-panel p-4 flex flex-col">
    <SettingItem label="自动定位加载点" content="点位加载完毕后移动到点集的几何中心">
      <el-switch v-model="localSettings.moveToCenter" />
    </SettingItem>

    <SettingItem label="自动跳转筛选器" content="筛选器满足选择条件时自动跳转到下一级">
      <el-switch v-model="localSettings.autoTurnNext" />
    </SettingItem>

    <SettingItem label="缓存">
      <template #content>
        <div class="flex flex-col gap-1">
          <el-progress class="progress-base-radius" text-inside :stroke-width="20" :percentage="usagePercentage" />
          <div>缓存使用情况： {{ usageStorage.toFixed(1) }} / {{ quotaStorage.toFixed(1) }} GB。存储配额由浏览器给出，并非实际可用空间。</div>
        </div>
      </template>
      <el-button :loading="cacheLaoding" @click="cleatAllCaches">
        删除缓存
      </el-button>
    </SettingItem>

    <SettingItem
      label="物品数据"
      :content="`已存储物品数据 ${itemStore.total} 项，距离下次更新剩余 ${Math.floor(itemStore.updateAllRestTime / 1000)} 秒。`"
    >
      <el-button :loading="itemStore.updateAllLoading" @click="itemStore.backgroundUpdate">
        更新物品
      </el-button>
    </SettingItem>

    <SettingItem
      label="点位数据"
      :content="`已存储点位数据 ${markerStore.total} 项，距离下次更新剩余 ${Math.floor(markerStore.updateAllRestTime / 1000)} 秒。`"
    >
      <el-button :loading="markerStore.updateAllLoading" @click="markerStore.backgroundUpdate">
        更新点位
      </el-button>
    </SettingItem>

    <SettingItem label="定时更新" content="定时更新物品和点位数据的时间间隔（分钟），定时修改只会在下次更新后生效。">
      <el-input-number v-model="localSettings.autoUpdateInterval" :min="10" :max="120" :step="10" />
    </SettingItem>
  </div>
</template>

<style lang="scss" scoped>
.setting-panel {
  min-width: 820px;
}

.progress-base-radius {
  :deep(.el-progress-bar__outer) {
    border-radius: 6px;
  }
  :deep(.el-progress-bar__inner) {
    border-radius: 6px;
  }
}
</style>
