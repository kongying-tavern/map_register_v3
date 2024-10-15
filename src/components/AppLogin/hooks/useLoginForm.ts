import { ElMessage } from 'element-plus'
import type { AxiosError } from 'axios'
import { useUserStore } from '@/stores'
import type { ElFormType } from '@/shared'
import { useFetchHook } from '@/hooks'
import type { ItemFormRules } from '@/utils'
import { passwordCheck } from '@/utils'

/** 登录逻辑封装 */
export const useLoginForm = () => {
  const userStore = useUserStore()

  const formRef = ref<ElFormType | null>(null)

  const loginForm = ref<API.SysTokenVO>({
    grant_type: 'password',
    username: import.meta.env.VITE_AUTO_COMPLETE_USERNAME ?? '',
    password: import.meta.env.VITE_AUTO_COMPLETE_PASSWORD ?? '',
  })

  const rules: ItemFormRules<API.SysTokenVO> = {
    username: [
      // 这里和注册不同，username 不一定是 Q 号
      {
        required: true,
        trigger: 'change',
        message: '用户名不能为空',
        validator: (_, v = '') => v.length > 0,
      },
    ],
    password: [passwordCheck()],
  }

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: () => userStore.login(loginForm.value),
  })

  const login = async () => {
    try {
      await formRef.value?.validate()
      await submit()
    }
    catch {
      // cancel, no error
    }
  }

  onSuccess((auth) => {
    ElMessage({
      type: auth?.message ? 'warning' : 'success',
      message: auth?.message || '登录成功',
      duration: 5000,
    })
  })

  onError((err) => {
    // 报错信息优化
    switch (err.message) {
      // 账号或密码错误
      case 'Bad credentials':
        ElMessage.error({
          message: `账号或密码错误`,
        })
        break
      // 其他错误
      default:
        ElMessage.error({
          message: `登录失败，原因为：${(err as AxiosError<{ error_description?: string }>).response?.data?.error_description}`,
        })
    }
  })

  return { formRef, rules, loginForm, login, onSuccess, onError, ...rest }
}
