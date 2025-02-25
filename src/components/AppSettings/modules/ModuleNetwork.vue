<script setup lang="ts">
import { WEBSOCKET_WORKER_CONFIG } from '@/configs'
import { usePreferenceStore, useSocketStore, useUserStore } from '@/stores'
import { SettingBar, SettingGroup, SettingPanel } from '../components'

const socketStore = useSocketStore()
const userStore = useUserStore()
const preferenceStore = usePreferenceStore()

const text = computed(() => {
  return socketStore.status === WebSocket.OPEN
    ? `${socketStore.delay} ms`
    : '未连接'
})

const wsEvents: { label: string, value: API.WSEventType, divider?: boolean }[] = [
  // 物品
  { label: '物品新增', value: 'ItemAdded' },
  { label: '物品删除', value: 'ItemDeleted' },
  { label: '物品更新', value: 'ItemUpdated' },
  { label: '物品数据库更新', value: 'ItemBinaryPurged' },
  // 点位
  { label: '点位新增', value: 'MarkerAdded' },
  { label: '点位删除', value: 'MarkerDeleted' },
  { label: '点位更新', value: 'MarkerUpdated' },
  { label: '点位批量更新', value: 'MarkerTweaked' },
  { label: '点位数据库更新', value: 'MarkerBinaryPurged' },
  // 点位关联
  { label: '关联新增', value: 'MarkerLinked' },
  { label: '关联数据库更新', value: 'MarkerLinkageBinaryPurged' },
  // 物品
  { label: '物品数据库更新', value: 'ItemBinaryPurged' },
  // 图标
  { label: '图标数据库更新', value: 'IconTagBinaryPurged' },
  // 公告
  { label: '公告新增', value: 'NoticeAdded' },
  { label: '公告删除', value: 'NoticeDeleted' },
  { label: '公告更新', value: 'NoticeUpdated' },
  // 用户
  { label: '用户踢出', value: 'UserKickedOut' },
]
</script>

<template>
  <SettingPanel>
    <SettingGroup name="Web Socket">
      <SettingBar label="响应时延" :note="`检测间隔: ${WEBSOCKET_WORKER_CONFIG.HEARTBEAT.INTERVAL / 1000}s`">
        <template #setting>
          {{ text }}
        </template>
      </SettingBar>

      <SettingBar label="操作">
        <template #setting>
          <el-button @click="() => socketStore.connect(userStore.info?.id)">
            连接
          </el-button>
        </template>
      </SettingBar>

      <SettingBar
        label="允许 socket 事件通知"
        :note="preferenceStore.enableNotice ? `已允许 ${preferenceStore.noticeEvents.length ?? 0} 个事件的通知` : '已关闭通知功能'"
        :detail-disabled="!preferenceStore.enableNotice"
      >
        <template #setting>
          <el-switch v-model="preferenceStore.enableNotice" />
        </template>

        <template #detail>
          <el-checkbox-group v-model="preferenceStore.noticeEvents">
            <div class="grid grid-cols-2 sm:grid-cols-4">
              <el-checkbox
                v-for="event in wsEvents"
                :key="event.value"
                :label="event.label"
                :value="event.value"
              />
            </div>
          </el-checkbox-group>
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
