<script setup lang="ts">
import { DeviceStatus } from '@/shared'
import dayjs from 'dayjs'
import { UAParser } from 'ua-parser-js'
import { isUnknown } from '../utils'

const props = defineProps<{
  data: API.SysUserDeviceVo
  isSelected?: boolean
}>()

const emits = defineEmits<{
  selectDevice: [API.SysUserDeviceVo]
}>()

const ua = computed(() => {
  return new UAParser(props.data.deviceId).getResult()
})

const statusLabel = computed(() => {
  return {
    [DeviceStatus.VALID]: { type: 'success', label: '允许' },
    [DeviceStatus.BLOCKED]: { type: 'danger', label: '禁用' },
  }[props.data.status!]
})
</script>

<template>
  <div
    class="device-card flex gap-1 text-xs"
    :class="{
      'is-selected': isSelected,
    }"
    @click="() => emits('selectDevice', data)"
  >
    <div class="flex-shrink-0">
      <div class="card-title font-bold">
        <el-tag
          v-if="statusLabel"
          :type="statusLabel.type"
          size="small"
          class="ml-[.5]"
          round
        >
          {{ statusLabel.label }}
        </el-tag>
        {{ isUnknown(ua.os) ? 'unknown' : `${ua.os.name} ${ua.os.version}` }}
      </div>
      <div>
        {{ isUnknown(ua.browser) ? 'unknown' : `${ua.browser.name} ${ua.browser.version}` }}
      </div>
    </div>

    <div class="flex-1 text-right">
      <div>
        {{ data.lastLoginTime ? dayjs(data.lastLoginTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
      </div>
      <div>
        {{ data.ipRegion?.isUnknown ? '' : `${data.ipRegion?.country} ${data.ipRegion?.province} ${data.ipRegion?.city} ${data.ipRegion?.region} ${data.ipRegion?.isp}` }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-card {
  --title-color: inherit;

  border-radius: 4px;
  padding: 4px;
  margin: 0 12px 4px 12px;

  .card-title {
    color: var(--title-color);
  }

  &:hover {
    background: var(--el-color-info-light-7);
  }

  &:active {
    background: var(--el-color-info-light-5);
  }

  &.is-selected {
    --title-color: var(--el-color-primary);
    background: var(--el-color-primary-light-7);
  }
}
</style>
