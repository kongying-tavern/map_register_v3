import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { messageFrom, saveUser } from '@/utils'
import Oauth from '@/api/oauth'

/** 登录逻辑封装 */
export const useLoginForm = () => {
  const loading = ref(false)
  const loginForm = reactive<API.SysTokenVO>({
    grant_type: 'password',
    username: import.meta.env.VITE_AUTO_COMPLETE_USERNAME ?? '',
    password: import.meta.env.VITE_AUTO_COMPLETE_PASSWORD ?? '',
  })

  const router = useRouter()

  const login = async () => {
    try {
      loading.value = true
      const res = await Oauth.oauth.token(loginForm)
      router.push('/')
      saveUser(res as any)
      ElMessage.success('登录成功')
    }
    catch (err) {
      ElMessage.error(messageFrom(err))
    }
    finally {
      loading.value = false
    }
  }

  return { loginForm, loading, login }
}
