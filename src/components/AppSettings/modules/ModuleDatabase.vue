<script setup lang="ts">
import db from '@/database'
import { now } from '@/shared'
import { useAreaStore, useIconTagStore, useItemStore, useItemTypeStore, useMarkerLinkStore, useMarkerStore } from '@/stores'
import { Refresh, RefreshLeft, WarnTriangleFilled } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { SettingBar, SettingGroup, SettingPanel } from '../components'

const areaStore = useAreaStore()
const iconTagStore = useIconTagStore()
const itemStore = useItemStore()
const itemTypeStore = useItemTypeStore()
const markerStore = useMarkerStore()
const markerLinkStore = useMarkerLinkStore()

const dbList = [
  {
    label: '地区',
    total: computed(() => areaStore.total),
    loading: computed(() => areaStore.updateLoading),
    nextUpdateTime: computed(() => areaStore.nextUpdateTime),
    message: computed(() => areaStore.context.message),
    updateDiff: () => areaStore.update(),
    updateFull: () => areaStore.update({ isFull: true }),
  },
  {
    label: '图标',
    total: computed(() => iconTagStore.total),
    loading: computed(() => iconTagStore.updateLoading),
    nextUpdateTime: computed(() => iconTagStore.nextUpdateTime),
    message: computed(() => iconTagStore.context.message),
    updateDiff: () => iconTagStore.update(),
    updateFull: () => iconTagStore.update({ isFull: true }),
  },
  {
    label: '物品',
    total: computed(() => itemStore.total),
    loading: computed(() => itemStore.updateLoading),
    nextUpdateTime: computed(() => itemStore.nextUpdateTime),
    message: computed(() => itemStore.context.message),
    updateDiff: () => itemStore.update(),
    updateFull: () => itemStore.update({ isFull: true }),
  },
  {
    label: '物品类型',
    total: computed(() => itemTypeStore.total),
    loading: computed(() => itemTypeStore.updateLoading),
    nextUpdateTime: computed(() => itemTypeStore.nextUpdateTime),
    message: computed(() => itemTypeStore.context.message),
    updateDiff: () => itemTypeStore.update(),
    updateFull: () => itemTypeStore.update({ isFull: true }),
  },
  {
    label: '点位',
    total: computed(() => markerStore.total),
    loading: computed(() => markerStore.updateLoading),
    nextUpdateTime: computed(() => markerStore.nextUpdateTime),
    message: computed(() => markerStore.context.message),
    updateDiff: () => markerStore.update(),
    updateFull: () => markerStore.update({ isFull: true }),
  },
  {
    label: '点位关联',
    total: computed(() => markerLinkStore.total),
    loading: computed(() => markerLinkStore.updateLoading),
    nextUpdateTime: computed(() => markerLinkStore.nextUpdateTime),
    message: computed(() => markerLinkStore.context.message),
    updateDiff: () => markerLinkStore.update(),
    updateFull: () => markerLinkStore.update({ isFull: true }),
  },
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
      <SettingBar
        v-for="store in dbList"
        :key="store.label"
        :label="store.label"
      >
        <template #note>
          <div class="text-xs text-[var(--el-text-color-regular)] mb-0.5">
            共 {{ store.total.value }} 项, 距离下次更新还有 {{ store.loading.value ? '----' : ((store.nextUpdateTime.value - now) / 1000).toFixed(0) }} 秒
          </div>
          <el-progress
            :percentage="100"
            :stroke-width="16"
            :duration="5"
            text-inside
            :show-text="false"
            :striped="store.loading.value"
            :striped-flow="store.loading.value"
            :status="store.loading.value ? '' : 'success'"
            style="width: 210px; --progress-radius: 2px"
          >
            <div class="w-[200px] text-left">
              {{ store.message.value || '就绪' }}
            </div>
          </el-progress>
        </template>

        <template #setting>
          <div class="flex flex-col">
            <el-button
              text type="primary" :icon="RefreshLeft"
              :loading="store.loading.value"
              @click="store.updateDiff"
            >
              差异更新
            </el-button>
            <el-button
              text type="warning" :icon="Refresh" style="margin-left: 0;"
              :loading="store.loading.value"
              @click="store.updateFull"
            >
              重新获取
            </el-button>
          </div>
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
