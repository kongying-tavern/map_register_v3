import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ElFormType } from '@/shared'
import Api from '@/api/api'
import Oauth from '@/api/oauth'
import { useFetchHook } from '@/hooks'
import { useArchiveStore, useUserStore } from '@/stores'
import type { ItemFormRules } from '@/utils'
import { passwordCheck, qqCheck } from '@/utils'

/** 注册逻辑封装 */
export const useRegisterForm = () => {
  const formRef = ref<ElFormType | null>(null)

  const registerForm = reactive<Required<API.SysUserRegisterVo>>({
    username: '',
    password: '',
  })

  watch(registerForm, () => {
    for (const key in registerForm) {
      const raw = registerForm[key as keyof API.SysUserRegisterVo] ?? ''
      registerForm[key as keyof API.SysUserRegisterVo] = raw.replace(/\s+/g, '')
    }
  }, { deep: true })

  const rules: ItemFormRules<API.SysUserRegisterVo> = {
    username: [qqCheck()],
    password: [passwordCheck()],
  }

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      await Api.sysUserController.registerUserByQQ(registerForm)
      return Oauth.oauth.token({
        grant_type: 'password',
        ...registerForm,
      })
    },
  })

  const register = async () => {
    try {
      await formRef.value?.validate()
      await submit()
    }
    catch {
      // cancel, no error
    }
  }

  const userStore = useUserStore()
  const router = useRouter()
  const archiveStore = useArchiveStore()

  onSuccess(async (auth) => {
    ElMessage.success({
      message: '注册成功',
      offset: 48,
    })
    userStore.setAuth(auth)
    await router.push('/map')
    await archiveStore.fetchArchive()
    archiveStore.loadLatestArchive()
  })

  onError(err => ElMessage.error({
    message: `注册失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { formRef, rules, registerForm, register, onSuccess, onError, ...rest }
}
