import { reactive, ref } from 'vue'
import type { FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { messageFrom } from '@/utils'
import { useUserStore } from '@/stores'
import type { ElFormType } from '@/shared'

/** 登录逻辑封装 */
export const useLoginForm = () => {
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
  const loginForm = reactive<API.SysTokenVO>({
    grant_type: 'password',
    username: import.meta.env.VITE_AUTO_COMPLETE_USERNAME ?? '',
    password: import.meta.env.VITE_AUTO_COMPLETE_PASSWORD ?? '',
  })

  const router = useRouter()
  const userStore = useUserStore()

  const login = async () => {
    if (!formRef.value)
      return
    try {
      loading.value = true
      const isValid = await formRef.value.validate().catch(() => false)
      if (!isValid)
        return
      await userStore.login(loginForm)
      ElMessage.success({
        message: '登录成功',
        duration: 1000,
      })
      await router.push('/')
    }
    catch (err) {
      ElMessage.error(messageFrom(err))
    }
    finally {
      loading.value = false
    }
  }

  return { formRef, rules, loginForm, loading, login }
}
