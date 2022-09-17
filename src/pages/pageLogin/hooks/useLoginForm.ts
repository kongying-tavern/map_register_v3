import { reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { token } from '@/api/oauth/token'
import { saveUser, messageFrom } from '@/utils'

/** 登录逻辑封装 */
export const useLoginForm = () => {
  const loading = ref(false)
  const loginForm = reactive({
    grant_type: 'password',
    username: import.meta.env.VITE_AUTO_COMPLETE_USERNAME ?? '',
    password: import.meta.env.VITE_AUTO_COMPLETE_PASSWORD ?? '',
  })

  const $q = useQuasar()
  const router = useRouter()

  const login = async () => {
    try {
      loading.value = true
      const res = await token(loginForm)
      saveUser(res as any)
      $q.notify({
        type: 'positive',
        message: '登录成功',
      })
      router.push('/')
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: messageFrom(err),
      })
    } finally {
      loading.value = false
    }
  }

  return { loginForm, loading, login }
}
