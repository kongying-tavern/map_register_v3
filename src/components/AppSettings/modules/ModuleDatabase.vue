<script setup lang="ts">
import { Refresh, RefreshLeft, WarnTriangleFilled } from '@element-plus/icons-vue'
import type { UnwrapRef } from 'vue'
import { ElMessageBox } from 'element-plus'
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { useAreaStore, useIconTagStore, useItemStore, useItemTypeStore, useMarkerLinkStore, useMarkerStore } from '@/stores'
import type { useBackendUpdate } from '@/stores/hooks'
import db from '@/database'

const options: { name: string; store: { total: number; backendUpdater: UnwrapRef<ReturnType<typeof useBackendUpdate>> } }[] = [
  { name: '地区', store: useAreaStore() },
  { name: '图标标签', store: useIconTagStore() },
  { name: '物品', store: useItemStore() },
  { name: '物品类型', store: useItemTypeStore() },
  { name: '点位', store: useMarkerStore() },
  { name: '点位关联', store: useMarkerLinkStore() },
]

const deleteDatabase = async () => {
  try {
    await ElMessageBox.confirm('将会完全删除数据库内所有数据并刷新页面，确认操作？', '警告', {
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      showClose: false,
      closeOnPressEscape: false,
      closeOnClickModal: false,
      beforeClose: (action, instance, done) => {
        if (action !== 'confirm')
          return done()
        instance.confirmButtonLoading = true
        instance.cancelButtonLoading = true
        instance.cancelButtonClass = 'is-disabled'
        db.delete().then(done)
      },
    })
    location.reload()
  }
  catch {
    // cancel, no error
  }
}
</script>

<template>
  <SettingPanel>
    <SettingGroup name="存储详情">
      <SettingBar v-for="({ name, store }) in options" :key="name" :label="name">
        <template #note>
          <div class="flex flex-col text-xs text-[var(--el-text-color-regular)]">
            <div>已存储 {{ store.backendUpdater.loading ? '...' : store.total }} 项数据</div>
            <div v-if="store.backendUpdater.isWatting">
              {{
                store.backendUpdater.isWatting
                  ? `距离更新还有 ${Math.floor(store.backendUpdater.restTime / 1000)} 秒`
                  : store.backendUpdater.loading
                    ? '正在更新...'
                    : '后台更新已停止'
              }}
            </div>
          </div>
        </template>
        <template #setting>
          <el-button text type="warning" :loading="store.backendUpdater.loading" :icon="Refresh" @click="() => store.backendUpdater.forceUpdate()">
            重新获取
          </el-button>
          <el-button text type="primary" :loading="store.backendUpdater.loading" :icon="RefreshLeft" @click="() => store.backendUpdater.refresh()">
            检查更新
          </el-button>
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="数据库设置">
      <SettingBar label="删除数据库" note="删除数据库并刷新应用来尝试解决数据库错误">
        <template #setting>
          <el-button type="danger" :icon="WarnTriangleFilled" @click="deleteDatabase">
            立即删除
          </el-button>
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
