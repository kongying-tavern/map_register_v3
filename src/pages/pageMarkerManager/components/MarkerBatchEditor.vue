<script lang="ts" setup>
import type { MarkerBatchEditForm } from '../hooks'
import { HiddenFlagEnum } from '@/shared'
import { AppTimeSelect } from '@/components'
import { useRefreshTime } from '@/hooks'

const props = defineProps<{
  modelValue: MarkerBatchEditForm
  selections: API.MarkerVo[]
  visible: boolean
}>()

const emits = defineEmits<{
  'update:modelValue': [form: MarkerBatchEditForm]
  'update:visible': [visible: boolean]
  'submit': []
}>()

const modelVisible = computed({
  get: () => props.visible,
  set: v => emits('update:visible', v),
})

const model = <K extends keyof MarkerBatchEditForm>(key: K) => computed({
  get: () => props.modelValue[key],
  set: v => emits('update:modelValue', { ...props.modelValue, [key]: v }),
})

const markerIds = computed(() => props.selections.map(marker => marker.id!))
const content = model('content')
const refreshTime = model('refreshTime')
const hiddenFlag = model('hiddenFlag')

const { refreshTimeTypeOptions, refreshTimeType, isCustom } = useRefreshTime(refreshTime)
</script>

<template>
  <el-dialog
    v-model="modelVisible"
    title="批量编辑"
    width="400px"
    align-center
    style="--el-dialog-border-radius: 8px;"
  >
    <div class="p-5">
      <el-form :model="modelValue">
        <el-form-item label="点位 id">
          <span>{{ markerIds.join(', ') }}</span>
        </el-form-item>

        <el-form-item label="点位内容">
          <el-input
            v-model="content"
            type="textarea"
            :rows="5"
          />
        </el-form-item>

        <el-form-item label="刷新时间">
          <div class="flex gap-2">
            <el-select-v2 v-model="refreshTimeType" :options="refreshTimeTypeOptions" class="" />
            <AppTimeSelect v-model="refreshTime" :disabled="!isCustom" class="w-full" />
          </div>
        </el-form-item>

        <el-form-item label="显示类型">
          <el-radio-group v-model="hiddenFlag">
            <el-radio-button :value="HiddenFlagEnum.SHOW">
              显示
            </el-radio-button>
            <el-radio-button :value="HiddenFlagEnum.HIDDEN">
              隐藏
            </el-radio-button>
            <el-radio-button :value="HiddenFlagEnum.NEIGUI">
              内鬼
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div class="flex justify-end">
        <el-button type="primary" @click="() => emits('submit')">
          提交
        </el-button>
        <el-button @click="modelVisible = false">
          取消
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>
