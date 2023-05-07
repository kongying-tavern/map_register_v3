<script lang="ts" setup>
import { Delete, Refresh, WarnTriangleFilled } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { SettingItem } from '.'
import { localSettings, useAreaStore, useIconTagStore, useItemStore, useItemTypeStore, useMarkerStore } from '@/stores'
import { useFetchHook } from '@/hooks'
import db from '@/database'

interface StoreLike {
  total: number
  updateAllLoading: boolean
  updateAllRestTime: number
  clearAll: () => Promise<void>
  backgroundUpdate: () => Promise<void>
}

const storeList: { name: string; store: StoreLike }[] = [
  { name: '地区', store: useAreaStore() },
  { name: '图标', store: useIconTagStore() },
  { name: '物品', store: useItemStore() },
  { name: '物品类型', store: useItemTypeStore() },
  { name: '点位', store: useMarkerStore() },
]

const { refresh: resetDatabase } = useFetchHook({
  onRequest: async () => {
    await ElMessageBox.confirm('本地数据库将被重建并刷新页面，确认操作？', '警告', {
      type: 'warning',
    })
    await db.delete()
    window.location.reload()
  },
})

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'
</script>

<template>
  <el-scrollbar>
    <div class="flex flex-col">
      <SettingItem
        v-for="store in storeList"
        :key="store.name"
        :label="`${store.name}数据`"
        :content="`已存储${store.name}数据 ${store.store.total} 项，距离下次更新剩余 ${Math.floor(store.store.updateAllRestTime / 1000)} 秒。`"
      >
        <div class="whitespace-nowrap">
          <el-button
            plain
            :loading="store.store.updateAllLoading"
            :icon="Delete"
            circle
            type="danger"
            @click="store.store.clearAll"
          />
          <el-button
            plain
            :loading="store.store.updateAllLoading"
            :icon="Refresh"
            circle
            type="primary"
            @click="store.store.backgroundUpdate"
          />
        </div>
      </SettingItem>

      <SettingItem
        label="定时更新"
        content="定时更新物品和点位数据的时间间隔（分钟），定时修改只会在下次更新后生效。"
      >
        <el-input-number v-model="localSettings.autoUpdateInterval" :min="10" :max="120" :step="10" />
      </SettingItem>

      <SettingItem
        label="重建本地数据库"
        content="当更新出现致命错误时尝试恢复"
      >
        <el-button type="danger" :disabled="isOfflineMode" :icon="WarnTriangleFilled" @click="resetDatabase">
          重建本地数据库
        </el-button>
      </SettingItem>
    </div>
  </el-scrollbar>
</template>
