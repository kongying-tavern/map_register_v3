<script lang="ts" setup>
import { GSButton, GSDivider, GSInput } from '@/components'
import { usePreferenceStore } from '@/stores'
import { PresetList } from '.'

const emit = defineEmits<{
  save: []
  delete: []
  load: []
}>()

const presetName = defineModel<string>('presetName', { required: true })

const preferenceStore = usePreferenceStore()
</script>

<template>
  <div class="flex flex-col h-full gap-3">
    <PresetList
      v-model:preset-name="presetName"
      title="预设列表"
      :list="preferenceStore.presets"
    />

    <div class="flex gap-2">
      <GSInput v-model="presetName" class="flex-1" placeholder="请输入预设名称" />
      <GSButton icon="submit" :disabled="!presetName" @click="emit('save')">
        保存
      </GSButton>
    </div>

    <GSDivider :height="24" color="#76716A" />

    <div class="flex gap-4">
      <GSButton
        :disabled="!presetName"
        class="flex-1"
        @click="emit('delete')"
      >
        <template #icon>
          <el-icon color="var(--gs-color-danger)">
            <DeleteFilled />
          </el-icon>
        </template>
        删除
      </GSButton>
      <GSButton
        :disabled="!presetName"
        class="flex-1"
        icon="submit"
        @click="emit('load')"
      >
        读取
      </GSButton>
    </div>
  </div>
</template>
