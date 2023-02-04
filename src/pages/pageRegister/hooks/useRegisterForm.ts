import { reactive, ref } from 'vue'
import type { FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { messageFrom } from '@/utils'
import type { ElFormType } from '@/shared'
import System from '@/api/system'

/** 登录逻辑封装 */
export const useRegisterForm = () => {
  const formRef = ref<ElFormType | null>(null)

  const registerForm = reactive<API.SysUserRegisterVo>({
    username: '',
    password: '',
  })

  const rules: FormRules = {
    username: [
      { required: true, message: 'QQ号不能为空' },
      { message: 'Q号格式有误', validator: (_, value = '') => /^\d+$/.test((registerForm.username = value.trim())) },
    ],
    password: [
      { required: true, message: '密码不能为空' },
      { message: '密码最短需要6位数', validator: (_, value = '') => (registerForm.password = value.trim()).length >= 6 },
    ],
  }

  const loading = ref(false)

  const register = async () => {
    if (!formRef.value)
      return
    try {
      loading.value = true
      const isValid = await formRef.value.validate().catch(() => false)
      if (!isValid)
        return
      await System.sysUserController.registerUserByQQ(registerForm)
      ElMessage.success({
        message: '注册成功',
        duration: 1000,
      })
    }
    catch (err) {
      ElMessage.error(messageFrom(err))
    }
    finally {
      loading.value = false
    }
  }

  const registerByQQ = async () => {
    if (!formRef.value)
      return
    try {
      loading.value = true
      const isValid = await formRef.value.validate().catch(() => false)
      if (!isValid)
        return
      await System.sysUserController.registerUserByQQ(registerForm, {
        auth: { username: 'client', password: 'secret' },
      })
      ElMessage.success({
        message: '注册成功',
        duration: 1000,
      })
    }
    catch (err) {
      ElMessage.error(messageFrom(err))
    }
    finally {
      loading.value = false
    }
  }

  return { formRef, rules, registerForm, loading, register, registerByQQ }
}
