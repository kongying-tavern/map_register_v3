<script lang="ts" setup>
import type { SettingVo } from '../hooks'

const props = defineProps<{
  modelValue: SettingVo
  settingName: Array<Record<string, string>>
}>()

const emit = defineEmits<{
  (e: 'change', v: SettingVo): void
}>()

const setting = ref<SettingVo>(props.modelValue)

const change = (key: string) => {
  emit('change', setting.value)
}
</script>

<template>
  <div class="">
    <el-alert :closable="false">
      设置界面实际功能暂时没有实现
    </el-alert>
    <el-form
      label-position="right"
      label-width="250px"
      style="max-width: 760px"
    >
      <!-- eslint-disable-next-line vue/valid-v-for -->
      <el-form-item v-for="item in settingName" :label="item.value">
        <el-input v-if="item.type === 'string'" v-model="setting[item.key]" />
        <el-switch v-if="item.type === 'boolean'" v-model="setting[item.key]" @change="change(item.key)" />
      </el-form-item>
    </el-form>
  </div>
</template>
