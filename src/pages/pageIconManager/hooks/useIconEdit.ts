import { ElMessage } from 'element-plus'
import type { IconDetailForm } from '../components'
import Api from '@/api/api'
import { GlobalDialogController, useFetchHook } from '@/hooks'

export const useIconEdit = (form: Ref<API.IconVo>) => {
  const formRef = ref<InstanceType<typeof IconDetailForm> | null>(null)

  const { refresh: submitEditIcon, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      await formRef.value?.getIconUrl()
      formRef.value?.syncData()
      await Api.icon.updateIcon(form.value)
    },
  })

  const editIcon = async () => {
    try {
      await formRef.value?.validate()
      await submitEditIcon()
    }
    catch {
      // cancel, no error
    }
  }

  onSuccess(() => {
    ElMessage.success({
      message: '编辑成功',
      offset: 48,
    })
    GlobalDialogController.close()
  })

  onError(err => ElMessage.error({
    message: `编辑图标失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { formRef, editIcon, onSuccess, onError, ...rest }
}
