<script setup lang="ts">
import { Refresh, WarnTriangleFilled } from '@element-plus/icons-vue'
import type { UnwrapRef } from 'vue'
import { SettingBar } from '../components'
import { useAreaStore, useIconTagStore, useItemStore, useItemTypeStore, useMarkerStore } from '@/stores'
import type { useBackendUpdate } from '@/stores/hooks'

const options: { name: string; store: { total: number; backendUpdater: UnwrapRef<ReturnType<typeof useBackendUpdate>> } }[] = [
  { name: '地区', store: useAreaStore() },
  { name: '图标标签', store: useIconTagStore() },
  { name: '物品', store: useItemStore() },
  { name: '物品类型', store: useItemTypeStore() },
  { name: '点位', store: useMarkerStore() },
]
</script>

<template>
  <div class="h-full flex flex-col overflow-auto">
    <div class="mb-4">
      <div class="pb-1">
        存储详情
      </div>
      <div class="flex flex-col gap-1">
        <SettingBar v-for="({ name, store }) in options" :key="name" :label="name">
          <template #note>
            <div class="flex flex-col text-xs text-[var(--el-text-color-regular)]">
              <div>已存储 {{ store.total }} 项数据</div>
              <div v-if="store.backendUpdater.isWatting">
                距离更新还有 {{ Math.floor(store.backendUpdater.restTime / 1000) }} 秒
              </div>
              <div v-else>
                后台更新已停止
              </div>
            </div>
          </template>
          <template #setting>
            <el-button :loading="store.backendUpdater.loading" :icon="Refresh" @click="store.backendUpdater.refresh">
              立即更新
            </el-button>
          </template>
        </SettingBar>
      </div>
    </div>

    <div class="mb-4">
      <div class="pb-1">
        数据库设置
      </div>
      <div class="flex flex-col gap-1">
        <SettingBar label="删除数据库" note="删除数据库并刷新应用来尝试解决数据库错误">
          <template #setting>
            <el-button type="danger" :icon="WarnTriangleFilled" @click.stop="">
              立即删除
            </el-button>
          </template>
        </SettingBar>
      </div>
    </div>
  </div>
</template>
