<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Delete, Setting } from '@element-plus/icons-vue'
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { AppVirtualTable } from '@/components'
import { useDevStore, usePreferenceStore } from '@/stores'
import { useBanner } from '@/hooks'

const devStore = useDevStore()
const { preference } = storeToRefs(usePreferenceStore())

const { visible } = useBanner()

const initLogInfo = (args: unknown[]) => {
  const str: {
    style: string
    text: string
    object?: boolean
  }[] = []

  const [prefix, prefixStyle, tagStyle, ...payloads] = args

  const styles: string[] = ['', `${prefixStyle}`, `${tagStyle}`]

  ;`${prefix}`.split('%c').forEach((code, index) => {
    if (!code)
      return
    str.push({
      style: styles[index] ?? '',
      text: code,
    })
  })

  payloads.forEach((payload) => {
    const text = `${payload}`
    if (text === '[object Object]') {
      str.push({
        style: 'margin-left: 4px',
        text: Object.prototype.toString.call(payload).replace(/(\[object )|(\])/g, ''),
        object: true,
      })
      return
    }
    str.push({
      style: 'margin-left: 4px',
      text,
    })
  })

  return str
}
</script>

<template>
  <SettingPanel>
    <SettingGroup name="日志">
      <div class="logger-list">
        <AppVirtualTable
          :data="devStore.visibleLogList"
          :item-height="24"
          :cached-rows="2"
          class="logger-list-content"
        >
          <template #default="{ item }">
            <div
              class="logger-item overflow-hidden whitespace-nowrap text-ellipsis"
              :class="`is-${item.type}`"
            >
              <span
                v-for="({ style, text, object }, index) in initLogInfo(item.args)"
                :key="index"
                :style="style"
              >
                <el-button v-if="object" size="small" link type="primary">
                  {{ text }}
                </el-button>
                <template v-else>
                  {{ text }}
                </template>
              </span>
            </div>
          </template>
        </AppVirtualTable>
      </div>

      <div class="flex justify-end items-center">
        <el-text size="small">
          {{ `${devStore.visibleLogList.length} / ${devStore.logList.length}` }} 次记录
        </el-text>
        <el-divider direction="vertical" style="height: 24px" />
        <el-button :icon="Delete" type="danger" @click="devStore.clearLogs">
          清空
        </el-button>
      </div>

      <SettingBar label="日志可见性" note="控制日志是否在面板上输出" :icon="Setting">
        <template #detail>
          <el-checkbox-group v-model="preference['developer.setting.enableLoggers']" @change="devStore.refreshLogs">
            <div class="grid grid-cols-4">
              <el-checkbox
                v-for="label in devStore.loggerLabels"
                :key="label"
                :value="label"
              >
                {{ label }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="调试">
      <SettingBar label="banner" note="banner 控制器">
        <template #setting>
          <el-switch v-model="visible" />
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>

<style scoped>
.logger-list {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: #23262A;
  color: white;
  font-size: 12px;
  font-family: monospace;
  border-radius: 4px;
}

.logger-item {
  --item-bg: transparent;

  padding: 2px 4px;
  background: var(--item-bg);
  clip-path: inset(1px 4px round 6px);

  &.is-warn {
    --item-bg: #413C26;
  }

  &.is-error {
    --item-bg: #4E3534;
  }
}
</style>
