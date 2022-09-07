import { reactive, ref } from 'vue'
import { token } from '@/api/oauth/token'
import { saveUser } from '@/utils'

/** 登录逻辑封装 */
export const useLoginForm = () => {
  const loading = ref(false)
  const loginForm = reactive({
    grant_type: 'password',
    username: '',
    password: '',
  })

  const login = async () => {
    try {
      loading.value = true
      const res = await token(loginForm)
      saveUser(res as any)
      // this.$q.notify({
      //   type: 'positive',
      //   message: '登录成功',
      // })
    } catch (err) {
      // TODO: 错误反馈
      console.log('[login]', err)
    } finally {
      loading.value = false
    }
  }

  return { loginForm, login }
}
