<script setup lang="ts">
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { usePreferenceStore, useSocketStore, useUserInfoStore } from '@/stores'

const socketStore = useSocketStore()
const userInfoStore = useUserInfoStore()

const url = computed(() => `${import.meta.env.VITE_WS_BASE}/${userInfoStore.info.id}`)

const text = computed(() => {
  return socketStore.status === WebSocket.OPEN
    ? `${socketStore.delay} ms`
    : '未连接'
})

const preferenceStore = usePreferenceStore()

const currentEvents = ref(preferenceStore.preference['socket.setting.noticeEvents'] ?? [])

watch(currentEvents, (events) => {
  preferenceStore.preference['socket.setting.noticeEvents'] = events
}, { deep: true })

const wsEvents: { label: string; value: API.WSEventType; divider?: boolean }[] = [
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
      <SettingBar label="响应时延" note="当前检测间隔: 5s">
        <template #setting>
          {{ text }}
        </template>
      </SettingBar>

      <SettingBar label="操作">
        <template #setting>
          <el-button @click="() => socketStore.connect(url)">
            连接
          </el-button>
        </template>
      </SettingBar>

      <SettingBar
        label="允许 socket 事件通知"
        :note="`已允许 ${currentEvents.length ?? 0} 个事件的通知`"
        :detail-disabled="!preferenceStore.preference['socket.setting.enableNotice']"
      >
        <template #setting>
          <el-switch v-model="preferenceStore.preference['socket.setting.enableNotice']" />
        </template>

        <template #detail>
          <el-checkbox-group v-model="currentEvents">
            <div class="grid grid-cols-4">
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
