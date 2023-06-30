<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import { iconCofig } from '.'
import { GSButton, GSDivider, GSInput } from '@/components'
import { useFetchHook } from '@/hooks'
import type { ElFormType } from '@/shared'
import { useUserStore } from '@/stores'
import Api from '@/api/api'

const userStore = useUserStore()

const form = ref<API.SysUserUpdateVo>({
  userId: userStore.info.id,
  nickname: userStore.info.nickname,
  qq: userStore.info.qq,
  phone: userStore.info.phone,
  logoUrl: userStore.info.logo,
})

const isDifference = computed(() => {
  const { nickname, qq, phone, logoUrl } = form.value
  const { nickname: rawNickname, qq: rawQQ, phone: rawPhone, logo: rawLogoUrl } = userStore.info
  return [
    [nickname, rawNickname],
    [qq, rawQQ],
    [phone, rawPhone],
    [logoUrl, rawLogoUrl],
  ].find(([a, b]) => {
    a ||= ''
    b ||= ''
    return a !== b
  })
})

const formRef = ref<ElFormType | null>(null)

const rules: FormRules = {
  nickname: [{ required: true, message: '昵称不能为空' }],
  qq: [{ required: true, message: '不是合法的Q号格式', validator: (_, v: string) => /[1-9][0-9][4,9]/.test(v) }],
  phone: [{ message: '不是合法的手机号格式', validator: (_, v: string) => !v || /^1[3-9]\d{9}$/.test(v) }],
}

const { refresh: updateUserInfo, loading } = useFetchHook({
  onRequest: async () => {
    if (!isDifference.value)
      throw new Error('校验失败')
    const isValid = await formRef.value?.validate().catch(() => false)
    if (!isValid)
      return
    await Api.sysUserController.updateUser({}, form.value)
    await userStore.updateUserInfo()
    document.documentElement.style.setProperty('--user-icon', `url("${userStore.info.logo}")`)
  },
})
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <el-form
      ref="formRef"
      style="--el-form-label-font-size: 18px; width: 370px"
      label-width="100px"
      label-position="left"
      :model="form"
      :rules="rules"
    >
      <el-form-item label="昵称" prop="nickname">
        <GSInput v-model="form.nickname" :disabled="loading" style="width: 100%" />
      </el-form-item>

      <el-form-item label="QQ" prop="qq">
        <GSInput v-model="form.qq" :disabled="loading" style="width: 100%" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <GSInput v-model="form.phone" :disabled="loading" style="width: 100%" />
      </el-form-item>
    </el-form>

    <GSButton
      :loading="loading"
      :disabled="!isDifference"
      theme="dark"
      icon="submit"
      style="width: 370px"
      @click="updateUserInfo"
    >
      保存
    </GSButton>

    <GSDivider />

    <!-- 溢出滚动 -->
    <div class="h-72 overflow-y-scroll">
      <!-- 显示所有头像 -->
      <div class="flex flex-wrap gap-3">
        <div
          v-for="item in iconCofig"
          :key="item.id"
          class="w-16 h-16 rounded-full cursor-pointer border-slate-300"
          :class="{ 'border-2': form.logoUrl !== item.icon, 'border-4': form.logoUrl === item.icon, 'border-blue-500': form.logoUrl === item.icon, 'border-slate-300': form.logoUrl !== item.icon }"
          :style="{ backgroundImage: `url(${item.icon})`, backgroundSize: 'cover' }"
          @click="form.logoUrl = item.icon"
        />
      </div>
    </div>
  </div>
</template>
