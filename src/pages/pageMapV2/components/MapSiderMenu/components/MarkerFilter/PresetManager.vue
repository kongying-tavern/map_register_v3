<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { GSButton, GSDivider, GSInput } from '@/components'
import { usePreferenceStore, useUserInfoStore } from '@/stores'
import type { Condition } from '@/stores/types'

const props = defineProps<{
  modelValue: boolean
  conditions: Map<string, Condition> | never[]
}>()

defineEmits<{
  'update:modelValue': [visible: boolean]
}>()

const { preference } = storeToRefs(usePreferenceStore())
const { info } = storeToRefs(useUserInfoStore())

const selectedConditionName = ref('')
const conditionName = ref('')

const validConditionName = computed({
  get: () => conditionName.value,
  set: (v) => {
    conditionName.value = v.replace(/\s+/g, '')
  },
})

const handleClosed = () => {
  selectedConditionName.value = ''
  conditionName.value = ''
}

const toggleSelectedName = (name: string) => {
  selectedConditionName.value = selectedConditionName.value === name ? '' : name
}

const savePreset = () => {
  if (info.value.id === undefined)
    return

  const presets = [...preference.value['markerFilter.setting.presets'] ?? []]
  const name = validConditionName.value
  const conditions = Object.fromEntries(props.conditions.entries())

  const findIndex = presets.findIndex(preset => preset.name === name)
  if (findIndex < 0)
    presets.push({ name, conditions })
  else
    presets[findIndex] = { name, conditions }

  preference.value['markerFilter.setting.presets'] = presets
  validConditionName.value = ''
}

const deletePreset = () => {
  if (info.value.id === undefined)
    return

  const presets = [...preference.value['markerFilter.setting.presets'] ?? []]
  const name = selectedConditionName.value

  const findIndex = presets.findIndex(preset => preset.name === name)
  if (findIndex < 0)
    return

  presets.splice(findIndex, 1)

  preference.value['markerFilter.setting.presets'] = presets
}

const loadPreset = () => {
  if (info.value.id === undefined)
    return

  const presets = [...preference.value['markerFilter.setting.presets'] ?? []]
  const name = selectedConditionName.value

  const findIndex = presets.findIndex(preset => preset.name === name)
  if (findIndex < 0)
    return

  const { conditions } = presets[findIndex]

  const itemIds: number[] = []

  for (const key in conditions) {
    const condition = conditions[key]
    itemIds.push(...condition.items)
  }

  preference.value['markerFilter.state.itemIds'] = itemIds
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :show-close="false"
    append-to-body
    align-center
    width="fit-content"
    class="custom-dialog hidden-header bg-transparent"
    @update:model-value="(v: boolean) => $emit('update:modelValue', v)"
    @closed="handleClosed"
  >
    <div class="gs-dark-card flex flex-col overflow-hidden genshin-text">
      <div class="text-xl text-center">
        点位筛选条件预设
      </div>

      <GSDivider color="#76716A" />

      <div class="text-white pb-2">
        · 新增预设
      </div>
      <div class="flex gap-2">
        <GSInput v-model="validConditionName" placeholder="请输入预设名称" />
        <GSButton class="flex-1" icon="submit" :disabled="!validConditionName" @click="savePreset">
          保存
        </GSButton>
      </div>

      <div class="text-white pt-4 pb-2">
        · 预设列表
      </div>
      <el-scrollbar class="flex-1">
        <div class="h-full flex flex-col gap-1 overflow-auto">
          <div
            v-for="state in preference['markerFilter.setting.presets']"
            :key="state.name"
            class="condition-row"
            :class="{
              actived: selectedConditionName === state.name,
            }"
            @click="() => toggleSelectedName(state.name)"
          >
            {{ state.name }}
          </div>
        </div>
      </el-scrollbar>

      <GSDivider color="#76716A" />

      <div class="flex gap-4">
        <GSButton
          :disabled="!selectedConditionName"
          class="flex-1"
          @click="deletePreset"
        >
          <template #icon>
            <el-icon color="var(--gs-color-danger)">
              <DeleteFilled />
            </el-icon>
          </template>
          删除
        </GSButton>
        <GSButton
          :disabled="!selectedConditionName"
          class="flex-1"
          icon="submit"
          @click="loadPreset"
        >
          读取
        </GSButton>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.gs-dark-card {
  padding: 36px 28px;
  background: paint(dark-card-border);
  color: var(--gs-text-color-priamry);
  width: 400px;
  height: 600px;
  max-width: 100dvw;
  max-height: 100dvh;
}

.condition-row {
  padding: 16px;
  background: #202D3F;
  outline: 2px solid #363F4A;
  outline-offset: -4px;
  display: flex;
  border-radius: 8px;
  transition: all linear 50ms;
  user-select: none;
  font-size: 16px;
  cursor: pointer;

  &:not(.actived):hover {
    outline-color: #FFF;
    outline-offset: -2px;
  }

  &:not(.actived):active {
    outline-offset: -4px;
  }

  &.actived {
    background: #F3E2BF;
    color: #202D3F;
  }
}
</style>
