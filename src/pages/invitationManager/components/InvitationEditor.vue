<script setup lang="ts">
import type { ElForm, FormItemRule } from 'element-plus'
import { GlobalDialogController, WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { GROUPED_ACCESS_POLICY_OPTIONS } from '@/shared'
import { useUserStore } from '@/stores'
import * as ElIcons from '@element-plus/icons-vue'
import { useInvitationCreate, useInvitationUpdate } from '../hooks'

const props = defineProps<{
  title: string
  data?: API.SysUserInvitationVo
}>()

const emits = defineEmits<{
  success: []
}>()

const userStore = useUserStore()

const isUpdateMode = props.data?.code !== undefined

const formRef = shallowRef<InstanceType<typeof ElForm>>()

const raw = JSON.parse(JSON.stringify(props.data ?? {})) as API.SysUserInvitationVo

const form = ref<API.SysUserInvitationVo>({
  accessPolicy: [
    'same_last_ip',
    'same_last_device',
  ],
  username: '',
  remark: '',
  ...props.data,
})

const isSame = computed(() => {
  const { username, remark, roleId, accessPolicy = [] } = form.value
  return [
    username === raw.username,
    remark === raw.remark,
    roleId === raw.roleId,
    JSON.stringify(accessPolicy.toSorted()) === JSON.stringify((raw.accessPolicy ?? []).toSorted()),
  ].every(Boolean)
})

const { data, loading, refresh: submit, onSuccess } = (isUpdateMode ? useInvitationUpdate : useInvitationCreate)({
  form,
  validate: () => formRef.value?.validate().catch(() => false),
})

onSuccess(() => {
  emits('success')
  GlobalDialogController.close(data.value)
})

const rules: Partial<Record<keyof API.SysUserInvitationVo, FormItemRule>> = {
  username: {
    required: true,
    validator: (_, v: string, cb) => {
      if (!v)
        return cb('用户名不能为空')
      if (/\s/.test(v))
        return cb('用户名不能包含空白字符')
      cb()
    },
  },
  roleId: {
    required: true,
    message: '必须选择一个权限',
  },
}
</script>

<template>
  <WinDialog class="w-[300px]">
    <WinDialogTitleBar :loading="loading" @close="GlobalDialogController.close">
      {{ props.title }}
    </WinDialogTitleBar>

    <WinDialogTabPanel>
      <el-form
        ref="formRef"
        label-position="top"
        :disabled="loading"
        :model="form"
        :rules="rules"
      >
        <el-form-item label="用户名" prop="username" :disabled="isUpdateMode">
          <el-input
            v-model="form.username"
          />
        </el-form-item>

        <el-form-item label="用户备注" prop="remark">
          <el-input
            v-model="form.remark"
          />
        </el-form-item>

        <el-form-item label="权限" prop="roleId">
          <el-select-v2
            v-model="form.roleId"
            :options="userStore.roleList"
            :props="{
              label: 'name',
              value: 'id',
            }"
            :disabled="userStore.roleListLoading"
            :loading="userStore.roleListLoading"
          />
        </el-form-item>

        <el-form-item label="登录策略" prop="accessPolicy">
          <el-select-v2
            v-model="form.accessPolicy"
            :options="GROUPED_ACCESS_POLICY_OPTIONS"
            :max-collapse-tags="1"
            multiple
            collapse-tags
            collapse-tags-tooltip
          />
        </el-form-item>
      </el-form>
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button
        :loading="loading"
        :disabled="isSame"
        :icon="ElIcons.Check"
        type="primary"
        @click="submit"
      >
        确认
      </el-button>
      <el-button
        :loading="loading"
        :disabled="loading"
        :icon="ElIcons.Close"
        @click="GlobalDialogController.close"
      >
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
