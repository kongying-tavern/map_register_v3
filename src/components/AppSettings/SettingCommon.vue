<script lang="ts" setup>
import { SettingItem } from '.'
import { localSettings } from '@/stores'

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
</script>

<template>
  <div class="flex flex-col">
    <SettingItem label="自动定位加载点" content="【实验功能】点位加载完毕后移动到点集的几何中心">
      <el-switch v-model="localSettings.moveToCenter" />
    </SettingItem>

    <SettingItem label="自动跳转筛选器" content="筛选器满足选择条件时自动跳转到下一级">
      <el-switch v-model="localSettings.autoTurnNext" />
    </SettingItem>

    <SettingItem label="更新提醒" content="是否需要为成功更新的数据弹出消息提示">
      <el-switch v-model="localSettings.noticeDataUpdated" />
    </SettingItem>

    <SettingItem label="点位鼠标指向反馈" content="【实验功能】开启点位指向反馈将会消耗更多 CPU 性能（需要刷新点位）">
      <el-switch v-model="localSettings.markerHoverFeedback" />
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
  </div>
</template>

<style lang="scss" scoped>
.progress-base-radius {
  :deep(.el-progress-bar__outer) {
    border-radius: 6px;
  }
  :deep(.el-progress-bar__inner) {
    border-radius: 6px;
  }
}
</style>
