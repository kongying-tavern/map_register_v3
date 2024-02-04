import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useArchiveStore, useUserAuthStore } from '@/stores'
import type { ElFormType } from '@/shared'
import { useFetchHook } from '@/hooks'
import Oauth from '@/api/oauth'
import type { ItemFormRules } from '@/utils'
import { passwordCheck } from '@/utils'

/** 登录逻辑封装 */
export const useLoginForm = () => {
  const formRef = ref<ElFormType | null>(null)

  const loginForm = reactive<API.SysTokenVO>({
    grant_type: 'password',
    username: import.meta.env.VITE_AUTO_COMPLETE_USERNAME ?? '',
    password: import.meta.env.VITE_AUTO_COMPLETE_PASSWORD ?? '',
  })

  watch(loginForm, () => {
    for (const key in loginForm) {
      if (key === 'loginForm')
        continue
      const raw = loginForm[key as keyof Omit<API.SysTokenVO, 'grant_type'>] ?? ''
      loginForm[key as keyof Omit<API.SysTokenVO, 'grant_type'>] = raw.replace(/\s+/g, '')
    }
  }, { deep: true })

  const rules: ItemFormRules<API.SysTokenVO> = {
    username: [
      // 这里和注册不同，username 不一定是Q号
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
    onRequest: () => Oauth.oauth.token(loginForm),
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

  const router = useRouter()
  const userAuthStore = useUserAuthStore()
  const archiveStore = useArchiveStore()

  onSuccess((auth) => {
    ElMessage.success({
      message: '登录成功',
      offset: 48,
    })
    userAuthStore.setAuth(auth)
    // TODO 登录后应当跳转到上次退出前保持的页面
    router.push('/map')
    // TODO 存档读取应当与登录组件解耦
    archiveStore.fetchArchive()
    archiveStore.loadLatestArchive()
  })

  onError((err) => {
    // 报错信息优化
    switch (err.message) {
      // 账号或密码错误
      case 'Bad credentials':
        ElMessage.error({
          message: `账号或密码错误`,
          offset: 48,
        })
        break
      // 其他错误
      default:
        ElMessage.error({
          message: `登录失败，原因为：${err.message}`,
          offset: 48,
        })
    }
  })

  return { formRef, rules, loginForm, login, onSuccess, onError, ...rest }
}
