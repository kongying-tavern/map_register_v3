<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { usePreferenceStore } from '@/stores'

const { preference } = storeToRefs(usePreferenceStore())
</script>

<template>
  <SettingPanel>
    <SettingGroup name="筛选器设置">
      <SettingBar label="条件预设" note="当前存储的自定义条件预设总数">
        <template #setting>
          <span class="text-sm">{{ preference['markerFilter.setting.presets']?.filter(p => p.name !== 'temp')?.length ?? 0 }}</span>
        </template>
      </SettingBar>
      <SettingBar label="自动跳转下级筛选" note="点位筛选器满足条件后自动跳转下一级筛选器">
        <template #setting>
          <el-switch v-model="preference['markerFilter.setting.autoNext']" />
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="地图设置">
      <SettingBar label="显示区域标签" note="地图上各国、地区、子地区的标签">
        <template #setting>
          <el-switch v-model="preference['map.setting.showZoneTag']" />
        </template>
      </SettingBar>
      <SettingBar label="弱化已完成点位" note="是否以半透明状态显示已完成点位">
        <template #setting>
          <el-switch v-model="preference['map.setting.transparentMarked']" />
        </template>
      </SettingBar>
      <SettingBar label="滚轮缩放过渡时间（毫秒）" note="使用滚轮进行缩放时，过渡所消耗的时间，设置为 0 时则取消过渡">
        <template #setting>
          <div class="flex flex-col">
            <el-input-number
              v-model="preference['map.setting.zoomTransitionDuration']"
              style="width: 140px"
              :min="0"
              :step="10"
              :max="200"
            />
          </div>
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="性能优化">
      <SettingBar label="低频拾取" note="在视图更新时暂停点位拾取计算">
        <template #setting>
          <el-switch v-model="preference['map.setting.pauseViewChangingPicking']" />
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
