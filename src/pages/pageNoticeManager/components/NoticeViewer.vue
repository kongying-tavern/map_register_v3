<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import type { ComputedRef } from 'vue'
import { useNoticeCreate, useNoticeUpdate } from '../hooks'
import {
  AppRichtextEditor,
  GlobalDialogController,
  WinDialog,
  WinDialogFooter,
  WinDialogTabPanel,
  WinDialogTitleBar,
} from '@/components'
import { Logger } from '@/utils'
import type { ItemFormRules } from '@/utils'
import type { ElFormType } from '@/shared'
import { NOTICE_NAME_MAP } from '@/shared'
import { useFetchHook } from '@/hooks'

const props = defineProps<{
  notice?: API.NoticeVo
  status: 'create' | 'update'
}>()

const emits = defineEmits<{
  success: []
}>()

const logger = new Logger('公告')

const formData = ref<API.NoticeVo>(JSON.parse(JSON.stringify(props.notice ?? {})))

const formRef = ref<ElFormType | null>(null)

const rules: ComputedRef<ItemFormRules<API.NoticeVo>> = computed(() => ({
  channel: [
    { required: true, message: '频道不能为空', trigger: 'change' },
  ],
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' },
  ],
  validTimeStart: [
    {
      validator: (rule, value: number | null, cb) => {
        if (!rule.required)
          return cb()
        if (!value)
          return cb('发布时间不能为空')
        if (!formData.value.validTimeEnd)
          return cb()
        if (value < new Date(formData.value.validTimeEnd).getTime())
          return cb('发布时间不能在截止时间之前')
        cb()
      },
    },
  ],
  validTimeEnd: [
    {
      validator: (_rule, value: number | null, cb) => {
        logger.info('校验 validTimeEnd', value)
        cb()
      },
    },
  ],
  content: [
    { required: true, message: '内容不能为空', trigger: 'blur' },
  ],
}))

const { createNotice } = useNoticeCreate()
const { updateNotice } = useNoticeUpdate()

const { loading, refresh: submit, onSuccess } = useFetchHook({
  onRequest: async () => {
    await formRef.value?.validate()
    await ({
      create: createNotice,
      update: updateNotice,
    })[props.status](formData.value)
  },
})

onSuccess(() => {
  GlobalDialogController.close()
  emits('success')
})

const channels = [...NOTICE_NAME_MAP.entries()].map(([channel, name]) => ({
  label: name,
  value: channel,
}))
</script>

<template>
  <WinDialog class="w-[720px]">
    <WinDialogTitleBar :loading="loading" @close="GlobalDialogController.close">
      {{ `${formData.id === undefined ? '添加' : '编辑'}公告` }}
    </WinDialogTitleBar>

    <WinDialogTabPanel>
      <el-form ref="formRef" v-bind="$attrs" label-width="80px" :model="formData" :rules="rules">
        <div class="grid grid-cols-2 gap-y-1 gap-x-4">
          <el-form-item class="col-span-2" label="标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入标题" clearable />
          </el-form-item>

          <el-form-item class="col-span-2" label="内容" prop="content">
            <AppRichtextEditor
              v-model="formData.content"
              style="max-height: 50vh;"
              :content-height="400"
              :base-text-size="20"
              :headers="[2, 4]"
              default-foreground="#4f473f"
              default-background="#fff"
              view-font="MHYG, sans-serif"
              :view-line-height="1.5"
              :view-zoom="0.75"
            />
          </el-form-item>

          <el-form-item label="发布时间" prop="validTimeStart">
            <el-date-picker v-model="formData.validTimeStart" style="--el-date-editor-width: 100%" type="datetime" placeholder="请选择发布时间" />
          </el-form-item>

          <el-form-item label="截止时间" prop="validTimeEnd">
            <el-date-picker v-model="formData.validTimeEnd" style="--el-date-editor-width: 100%" type="datetime" placeholder="请选截止时间" />
          </el-form-item>

          <el-form-item label="频道" prop="channel">
            <el-select-v2
              v-model="formData.channel"
              style="width: 100%"
              placeholder="请选择频道"
              :options="channels"
              clearable
              collapse-tags
              collapse-tags-tooltip
              multiple
            />
          </el-form-item>

          <el-form-item label="排序" prop="sortIndex">
            <el-input-number v-model="formData.sortIndex" :min="0" style="width: 100%" />
          </el-form-item>
        </div>
      </el-form>
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button :icon="Check" type="primary" :loading="loading" @click="submit">
        确认
      </el-button>
      <el-button :icon="Close" :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
