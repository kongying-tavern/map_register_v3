import { ElMessage } from 'element-plus'
import { useValidateStatus } from './useValidateStatus'
import type { ElFormType } from '@/shared'
import { useFetchHook } from '@/hooks'
import type { ItemFormRules } from '@/utils'
import Api from '@/api/api'
import { useUserStore } from '@/stores'

/** 注册逻辑封装 */
export const useRegisterForm = () => {
  const userStore = useUserStore()

  const formRef = ref<ElFormType | null>(null)

  const { isValid, handleValidate } = useValidateStatus({
    keys: [
      'username',
      'password',
      'repeatPassword',
    ],
  })

  const form = ref({
    username: '',
    password: '',
    repeatPassword: '',
  })

  const rules: ItemFormRules<typeof form.value> = {
    username: {
      required: true,
      validator: (_, v: string, callback) => {
        if (v.length < 6)
          return callback('不能少于 6 个字符')
        if (v.match(/\s/))
          return callback('不能包含空白字符')
        callback()
      },
    },
    password: {
      required: true,
      validator: (_, v: string, callback) => {
        if (v.length < 6)
          return callback('不能少于 6 个字符')
        if (v.match(/\s/))
          return callback('不能包含空白字符')
        callback()
      },
    },
    repeatPassword: {
      required: true,
      validator: (_, v: string, callback) => {
        if (v.length < 6)
          return callback('不能少于 6 个字符')
        if (v.match(/\s/))
          return callback('不能包含空白字符')
        if (v !== form.value.password)
          return callback('两次密码不一致')
        callback()
      },
    },
  }

  const { refresh: register, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      const isFormValie = await formRef.value?.validate().then(() => true).catch(() => false)
      if (!isFormValie)
        throw new Error('表单校验未通过')
      const { username, password } = form.value
      await Api.user.registerUserByQQ({
        username,
        password,
      })
      // 注册后自动登录
      const auth = await userStore.login({
        grant_type: 'password',
        username,
        password,
      })
      return auth
    },
  })

  onSuccess(() => {
    ElMessage({
      type: 'success',
      message: '注册成功',
    })
  })

  onError((err) => {
    ElMessage({
      type: 'error',
      message: `注册失败，原因为：${err.message}`,
    })
  })

  return {
    formRef,
    isValid,
    rules,
    form,
    register,
    onSuccess,
    onError,
    handleValidate,
    ...rest,
  }
}
