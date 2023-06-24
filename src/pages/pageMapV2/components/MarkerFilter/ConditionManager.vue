<script lang="ts" setup>
import { useCondition } from '../../hooks'
import { GSButton, GSDivider, GSInput, GSMessageService } from '@/components'
import { useUserStore } from '@/stores'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [visible: boolean]
}>()

const conditionManager = useCondition()
const userStore = useUserStore()

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

const addCondition = async () => {
  if (validConditionName.value === 'temp') {
    GSMessageService.info('不能与内置存储条件同名')
    return
  }
  await conditionManager.saveState(validConditionName.value)
  validConditionName.value = ''
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
        条件列表
      </div>

      <GSDivider color="#76716A" />

      <div class="flex gap-2 pb-4">
        <GSInput v-model="validConditionName" />
        <GSButton class="flex-1" icon="submit" :disabled="!validConditionName" @click="addCondition">
          新增
        </GSButton>
      </div>

      <el-scrollbar class="flex-1">
        <div class="h-full flex flex-col gap-1 overflow-auto">
          <div
            v-for="state in userStore.preference.filterStates"
            :key="state.name"
            class="condition-row"
            :class="{
              actived: selectedConditionName === state.name,
            }"
            @click="() => toggleSelectedName(state.name)"
          >
            {{ state.name === 'temp' ? '-- 临时存储条件 --' : state.name }}
          </div>
        </div>
      </el-scrollbar>

      <GSDivider color="#76716A" />

      <div class="flex gap-4">
        <GSButton
          :disabled="!selectedConditionName || selectedConditionName === 'temp'"
          class="flex-1"
          @click="() => conditionManager.deleteState(selectedConditionName)"
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
          @click="() => conditionManager.loadState(selectedConditionName)"
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
