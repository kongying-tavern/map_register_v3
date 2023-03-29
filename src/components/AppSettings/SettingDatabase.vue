<script lang="ts" setup>
import { Delete, Refresh } from '@element-plus/icons-vue'
import SettingItem from './SettingItem.vue'
import { localSettings, useAreaStore, useIconStore, useItemStore, useItemTypeStore, useMarkerStore } from '@/stores'

interface StoreLike {
  total: number
  updateAllLoading: boolean
  updateAllRestTime: number
  clearAll: () => Promise<void>
  backgroundUpdate: () => Promise<void>
}

const storeList: { name: string; store: StoreLike }[] = [
  { name: '地区', store: useAreaStore() },
  { name: '图标', store: useIconStore() },
  { name: '物品', store: useItemStore() },
  { name: '物品类型', store: useItemTypeStore() },
  { name: '点位', store: useMarkerStore() },
]
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
    </div>
  </el-scrollbar>
</template>
