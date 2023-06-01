import { reactive, ref } from 'vue'
import type { FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useArchiveStore, useUserStore } from '@/stores'
import type { ElFormType } from '@/shared'
import { useFetchHook } from '@/hooks'

/** 登录逻辑封装 */
export const useLoginForm = () => {
  const formRef = ref<ElFormType | null>(null)

  const loginForm = reactive<API.SysTokenVO>({
    grant_type: 'password',
    username: import.meta.env.VITE_AUTO_COMPLETE_USERNAME ?? '',
    password: import.meta.env.VITE_AUTO_COMPLETE_PASSWORD ?? '',
  })

  const rules: FormRules = {
    username: [
      { required: true, trigger: 'change', message: '用户名不能为空', validator: (_, value = '') => (loginForm.username = value.trim()).length > 0 },
    ],
    password: [
      { required: true, trigger: 'change', message: '密码不能为空', validator: (_, value = '') => (loginForm.password = value.trim()).length > 0 },
    ],
  }

  const router = useRouter()
  const userStore = useUserStore()

  const { refresh: login, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      if (!formRef.value)
        throw new Error('表单实例为空')
      const isValid = await formRef.value.validate().catch(() => false)
      if (!isValid)
        throw new Error('数据校验失败')
      await userStore.login(loginForm)
    },
  })

  const archiveStore = useArchiveStore()

  onSuccess(async () => {
    ElMessage.success({
      message: '登录成功',
      duration: 1000,
    })
    await router.push('/')
    await archiveStore.fetchArchive()
    archiveStore.loadLatestArchive()
  })

  onError((err) => {
    ElMessage.error({
      message: err.message,
      duration: 1000,
    })
  })

  return { formRef, rules, loginForm, login, onSuccess, onError, ...rest }
}
