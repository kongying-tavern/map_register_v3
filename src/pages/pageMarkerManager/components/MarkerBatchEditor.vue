<script lang="ts" setup>
import type { MarkerBatchEditForm } from '../hooks'
import { HiddenFlagEnum } from '@/shared'
import { AppTimeSelect } from '@/components'

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
</script>

<template>
  <el-dialog
    v-model="modelVisible"
    title="批量编辑"
    width="fit-content"
    align-center
    style="--el-dialog-border-radius: 8px;"
  >
    <div class="marker-batch-editor p-5">
      <el-form :model="modelValue">
        <el-form-item label="点位 id">
          <span>{{ markerIds.join(', ') }}</span>
        </el-form-item>

        <el-form-item label="点位内容">
          <el-input
            v-model="content"
            type="textarea"
          />
        </el-form-item>

        <el-form-item label="刷新时间">
          <AppTimeSelect v-model="refreshTime" class="w-full" />
        </el-form-item>

        <el-form-item label="显示类型">
          <el-radio-group v-model="hiddenFlag">
            <el-radio-button :label="HiddenFlagEnum.SHOW">
              显示
            </el-radio-button>
            <el-radio-button :label="HiddenFlagEnum.HIDDEN">
              隐藏
            </el-radio-button>
            <el-radio-button :label="HiddenFlagEnum.NEIGUI">
              内鬼
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="modelVisible = false">取消</el-button>
        <el-button type="primary" @click="() => emits('submit')">
          提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.marker-batch-editor {
  width: 540px;
}
</style>
