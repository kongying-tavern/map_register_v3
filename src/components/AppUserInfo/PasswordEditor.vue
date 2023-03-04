<script lang="ts" setup>
import { GSButton, GSInput } from '@/components'
import { useFetchHook } from '@/hooks'
import { useUserStore } from '@/stores'
import Api from '@/api/api'

const userStore = useUserStore()

const form = ref<Required<API.SysUserPasswordUpdateDto>>({
  userId: userStore.info.id ?? -9999,
  oldPassword: '',
  password: '',
})

const content = ref('')
const error = ref(false)
const visible = computed(() => content.value.length > 0)

const resetPopper = () => {
  content.value = ''
  error.value = false
}

const { loading, refresh: updatePassword, onSuccess, onError } = useFetchHook({
  onRequest: async () => {
    resetPopper()
    form.value.oldPassword = form.value.oldPassword.trim()
    form.value.password = form.value.password.trim()
    const { userId, oldPassword, password } = form.value
    // 校验
    if (userId < 0)
      throw new Error('用户 id 异常')
    if (!oldPassword || !password)
      throw new Error('密码不能为空')
    if (password.length < 6)
      throw new Error('密码不能小于 6 位数')

    await Api.sysUserController.updateUserPassword({}, form.value)
    userStore.logout()
  },
})

onSuccess(() => {
  error.value = false
  content.value = '修改成功'
})

onError((err) => {
  error.value = true
  content.value = err.message
})

const buttonRef = ref<HTMLElement | null>(null)
onClickOutside(buttonRef, resetPopper)
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <div class="gs-form-item">
      <div>旧密码</div>
      <GSInput v-model="form.oldPassword" style="width: 300px" />
    </div>
    <div class="gs-form-item">
      <div>新密码</div>
      <GSInput v-model="form.password" style="width: 300px" />
    </div>
    <el-tooltip
      placement="bottom"
      :content="content"
      :visible="visible"
      effect="customized"
      :popper-class="{
        'genshin-text': true,
        error,
      }"
    >
      <GSButton ref="buttonRef" icon="submit" dark :loading="loading" @click="updatePassword">
        修改密码
      </GSButton>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.gs-form-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #435066;
  font-size: 18px;
}
</style>

<style lang="scss">
.el-popper.is-customized {
  --background: rgb(159, 229, 151);
  padding: 10px 24px;
  color: #FFF;
  font-size: 18px;
  border-radius: 999px;
  &.error {
    --background: #CF5945;
  }
  background: var(--background);
  .el-popper__arrow::before {
    background: var(--background);
  }
}
</style>
