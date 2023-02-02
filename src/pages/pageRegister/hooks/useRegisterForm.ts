import { reactive, ref } from 'vue'
import type { FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { messageFrom } from '@/utils'
import type { ElFormType } from '@/shared'
import System from '@/api/system'

/** 登录逻辑封装 */
export const useRegisterForm = () => {
  const formRef = ref<ElFormType | null>(null)

  const rules: FormRules = {
    username: [
      { required: true, message: '用户名不能为空' },
    ],
    password: [
      { required: true, message: '密码不能为空' },
    ],
  }

  const loading = ref(false)
  const registerForm = reactive<API.SysUserRegisterVo>({
    username: '',
    password: '',
  })

  const register = async () => {
    if (!formRef.value)
      return
    try {
      loading.value = true
      const isValid = await formRef.value.validate().catch(() => false)
      if (!isValid)
        return
      await System.sysUserController.registerUser(registerForm, {
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
