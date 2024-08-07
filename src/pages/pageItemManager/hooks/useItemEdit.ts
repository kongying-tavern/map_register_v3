import { pick } from 'lodash'
import type { ItemDetailForm } from '../components'
import { useFetchHook } from '@/hooks'
import { GSMessageService, GlobalDialogController } from '@/components'
import Api from '@/api/api'

export interface ItemEditHookOptions {
  initFormData?: () => API.ItemVo
}

const sharedEditSame = ref<0 | 1>(0)

export const useItemEdit = (options: ItemEditHookOptions = {}) => {
  const { initFormData } = options

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: (editSame: 0 | 1, item: API.ItemVo) => Api.item.updateItem({ editSame }, [item]),
  })

  const detailFormRef = ref<InstanceType<typeof ItemDetailForm> | null>(null)
  const formData = ref<API.ItemVo>(initFormData?.() ?? {})

  /** 只选择需要的字段 */
  const pickRequiredKeys = (item: API.ItemVo): API.ItemVo => pick(item, [
    'id',
    'name',
    'areaId',
    'defaultContent',
    'iconTag',
    'typeIdList',
    'iconStyleType',
    'hiddenFlag',
    'defaultRefreshTime',
    'defaultCount',
    'sortIndex',
    'specialFlag',
    'version',
  ])

  const handleSubmit = async () => {
    const isValid = await detailFormRef.value?.validate()
    if (!isValid)
      return
    const form = pickRequiredKeys(formData.value)
    await submit(sharedEditSame.value, form)
  }

  onSuccess(() => {
    GSMessageService.info('编辑成功', {
      type: 'success',
      duration: 3000,
    })
    GlobalDialogController.close()
  })

  onError((err) => {
    GSMessageService.info(`编辑失败: ${err.message}`, {
      type: 'error',
      duration: 50000,
    })
  })

  return { detailFormRef, formData, handleSubmit, onSuccess, onError, ...rest }
}
