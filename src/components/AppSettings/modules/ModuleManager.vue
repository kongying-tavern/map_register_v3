<script setup lang="ts">
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { ManagerModule } from '@/shared'
import { usePreferenceStore } from '@/stores'

const preference = usePreferenceStore()

const pageSizeMap = computed(() => new Map(preference.preference['manager.setting.pageSize']))

const usePageSize = (module: ManagerModule) => computed({
  get: () => pageSizeMap.value.get(module) ?? 10,
  set: (size) => {
    const result = new Map(pageSizeMap.value).set(module, size).entries()
    preference.preference['manager.setting.pageSize'] = [...result]
  },
})

const itemPageSize = usePageSize(ManagerModule.Item)
const markerPageSize = usePageSize(ManagerModule.Marker)
const typePageSize = usePageSize(ManagerModule.Type)
const noticePageSize = usePageSize(ManagerModule.Notice)
const historyPageSize = usePageSize(ManagerModule.History)
</script>

<template>
  <SettingPanel>
    <SettingGroup name="物品管理">
      <SettingBar label="分页项目数">
        <template #setting>
          <el-input-number v-model="itemPageSize" :min="10" :max="100" :step="1" />
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="点位管理">
      <SettingBar label="分页项目数">
        <template #setting>
          <el-input-number v-model="markerPageSize" :min="10" :max="100" :step="1" />
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="类型管理">
      <SettingBar label="分页项目数">
        <template #setting>
          <el-input-number v-model="typePageSize" :min="10" :max="100" :step="1" />
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="用户管理">
      <SettingBar label="分页项目数">
        <template #setting>
          <el-input-number v-model="noticePageSize" :min="10" :max="100" :step="1" />
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="公告管理">
      <SettingBar label="分页项目数">
        <template #setting>
          <el-input-number v-model="noticePageSize" :min="10" :max="100" :step="1" />
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="历史记录">
      <SettingBar label="分页项目数">
        <template #setting>
          <el-input-number v-model="historyPageSize" :min="10" :max="100" :step="1" />
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
