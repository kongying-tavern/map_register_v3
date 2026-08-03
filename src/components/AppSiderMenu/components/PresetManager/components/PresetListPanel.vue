<script lang="ts" setup>
import { GSButton, GSDivider, GSInput } from '@/components'
import { usePreferenceStore } from '@/stores'
import { SelectList } from '../../SelectList'

const emit = defineEmits<{
  save: []
  delete: []
  load: []
}>()

const presetName = defineModel<string>('presetName', { required: true })

const preferenceStore = usePreferenceStore()
</script>

<template>
  <div class="flex gap-2 pb-3">
    <GSInput v-model="presetName" class="flex-1" placeholder="请输入预设名称" />
    <GSButton icon="submit" :disabled="!presetName" @click="emit('save')">
      保存
    </GSButton>
  </div>

  <div class="flex flex-col flex-1 overflow-hidden">
    <div class="text-white pt-4 pb-2">
      · 预设列表
    </div>
    <el-scrollbar class="flex-1">
      <SelectList
        v-model="presetName"
        class="h-full max-h-0"
        :list="preferenceStore.presets"
        value-key="name"
      >
        <template #default="{ item, isActived }">
          <div :title="item.name" class="w-full flex justify-between items-center overflow-hidden">
            <div class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ item.name }}
            </div>
            <div
              v-if="item.type === 'advanced'"
              class="flex-shrink-0 rounded text-xs px-1 py-0.5 text-white"
              :class="isActived ? 'bg-[#3E4556]' : 'bg-[#111821]'"
              title="该预设为高级筛选的预设"
            >
              Pro
            </div>
          </div>
        </template>
      </SelectList>
    </el-scrollbar>

    <GSDivider color="#76716A" />

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
