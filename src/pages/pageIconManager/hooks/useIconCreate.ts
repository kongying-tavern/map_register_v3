import { ElMessage } from 'element-plus'
import type { IconDetailForm } from '../components'
import { GlobalDialogController } from '@/components'
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

export const useIconCreate = (form: Ref<API.IconVo>) => {
  const formRef = ref<InstanceType<typeof IconDetailForm> | null>(null)

  const { refresh: submitCreateIcon, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async () => {
      await formRef.value?.getIconUrl()
      formRef.value?.syncData()
      await Api.icon.createIcon(form.value)
    },
  })

  const createIcon = async () => {
    try {
      await formRef.value?.validate()
      await submitCreateIcon()
    }
    catch {
      // cancel, no error
    }
  }

  onSuccess(() => {
    ElMessage.success({
      message: '添加成功',
      offset: 48,
    })
    GlobalDialogController.close()
  })

  onError(err => ElMessage.error({
    message: `添加图标失败，原因为：${err.message}`,
    offset: 48,
  }))

  return { formRef, createIcon, onSuccess, onError, ...rest }
}
