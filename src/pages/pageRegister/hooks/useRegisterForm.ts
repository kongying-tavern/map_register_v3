import { reactive, ref } from 'vue'
import type { FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { ElFormType } from '@/shared'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

/** 登录逻辑封装 */
export const useRegisterForm = () => {
  const formRef = ref<ElFormType | null>(null)

  const registerForm = reactive<API.SysUserRegisterVo>({
    username: '',
    password: '',
  })

  watch(registerForm, () => {
    for (const key in registerForm) {
      const raw = registerForm[key as keyof API.SysUserRegisterVo] ?? ''
      registerForm[key as keyof API.SysUserRegisterVo] = raw.replace(/\s+/g, '')
    }
  }, { deep: true })

  const rules: FormRules = {
    username: [
      { required: true, message: 'QQ号不能为空' },
      { message: 'Q号格式有误', validator: (_, v = '') => /^\d+$/.test(v) },
    ],
    password: [
      { required: true, message: '密码不能为空' },
      { message: '密码最短需要6位数', validator: (_, v = '') => v.length >= 6 },
    ],
  }

  const { refresh: register, onSuccess, ...rest } = useFetchHook({
    onRequest: async () => {
      if (!formRef.value)
        throw new Error('表单实例为空')
      const isValid = await formRef.value.validate().catch(() => false)
      if (!isValid)
        throw new Error('数据校验失败')
      await Api.sysUserController.registerUserByQQ(registerForm)
    },
  })

  onSuccess(() => ElMessage.success({
    message: '注册成功',
    duration: 1000,
  }))

  return { formRef, rules, registerForm, register, onSuccess, ...rest }
}
