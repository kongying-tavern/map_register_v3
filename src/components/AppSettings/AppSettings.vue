<script lang="ts" setup>
import SettingItem from './SettingItem.vue'
import { localSettings, useItemStore, useMarkerStore } from '@/stores'

const usageStorage = ref(0)
const quotaStorage = ref(0)
const cacheLaoding = ref(false)

/** 计算缓存大小 */
const calculateCaches = async () => {
  const { usage = 0, quota = 0 } = (await navigator.storage.estimate())
  usageStorage.value = Math.ceil(usage / (2 ** (10 * 3)))
  quotaStorage.value = Math.ceil(quota / (2 ** (10 * 3)))
}
calculateCaches()

/** 删除全部缓存 */
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

    <SettingItem label="缓存" :content="`缓存占用约 ${usageStorage} GB 大小数据，剩余配额约 ${quotaStorage} GB。`">
      <el-button :loading="cacheLaoding" @click="cleatAllCaches">
        删除缓存
      </el-button>
    </SettingItem>

    <SettingItem label="物品数据" :content="`已存储物品数据 ${itemStore.total} 项`">
      <el-button :loading="itemStore.updateAllLoading" @click="itemStore.updateAll">
        更新物品
      </el-button>
    </SettingItem>

    <SettingItem label="点位数据" :content="`已存储点位数据 ${markerStore.total} 项`">
      <el-button :loading="markerStore.updateAllLoading" @click="markerStore.updateAll">
        更新点位
      </el-button>
    </SettingItem>
  </div>
</template>

<style lang="scss" scoped>
.setting-panel {
  min-width: 820px;
}
</style>
