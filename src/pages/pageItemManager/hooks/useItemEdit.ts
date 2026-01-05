import type { ItemDetailForm } from '../components'
import type * as API2 from '@/api/alova/globals'
import { pick } from 'lodash'
import { GSMessageService } from '@/components'
import { useFetchHook } from '@/hooks'
import { useItemStore } from '@/stores'

export interface ItemEditHookOptions {
  initFormData?: () => API2.ItemVo
}

/** 只选择需要的字段 */
const pickRequiredKeys = (item: API2.ItemVo): API2.ItemVo => pick(item, [
  'id',
  'name',
  'areaId',
  'defaultContent',
  'iconId',
  'typeIdList',
  'iconStyleType',
  'hiddenFlag',
  'defaultRefreshTime',
  'defaultCount',
  'sortIndex',
  'specialFlag',
  'version',
])

export const useItemEdit = (options: ItemEditHookOptions = {}) => {
  const { initFormData } = options

  const itemStore = useItemStore()

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (item: API2.ItemVo) => {
      await itemStore.updateItem(pickRequiredKeys(item))
    },
  })

  const detailFormRef = ref<InstanceType<typeof ItemDetailForm> | null>(null)
  const formData = ref<API2.ItemVo>(initFormData?.() ?? {})

  const handleSubmit = async () => {
    const isValid = await detailFormRef.value?.validate()
    if (!isValid)
      return
    await submit(formData.value)
  }

  onSuccess(() => {
    GSMessageService.info('编辑成功', {
      type: 'success',
      duration: 3000,
    })
  })

  onError((err) => {
    GSMessageService.info(`编辑失败: ${err.message}`, {
      type: 'error',
      duration: 50000,
    })
  })

  return { detailFormRef, formData, handleSubmit, onSuccess, onError, ...rest }
}
