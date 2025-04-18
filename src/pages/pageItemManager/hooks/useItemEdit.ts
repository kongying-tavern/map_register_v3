import type { ItemDetailForm } from '../components'
import Api from '@/api/api'
import { GSMessageService } from '@/components'
import { useFetchHook } from '@/hooks'
import { useSocketStore } from '@/stores'
import { pick } from 'lodash'

export interface ItemEditHookOptions {
  initFormData?: () => API.ItemVo
}

const sharedEditSame = ref<0 | 1>(0)

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

export const useItemEdit = (options: ItemEditHookOptions = {}) => {
  const { initFormData } = options

  const socketStore = useSocketStore()

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (editSame: 0 | 1, item: API.ItemVo) => {
      const { error, message } = await Api.item.updateItem({ editSame }, [pickRequiredKeys(item)])
      if (error)
        throw new Error(message)
      socketStore.socketEvent.emit('ItemUpdated', item.id!)
    },
  })

  const detailFormRef = ref<InstanceType<typeof ItemDetailForm> | null>(null)
  const formData = ref<API.ItemVo>(initFormData?.() ?? {})

  const handleSubmit = async () => {
    const isValid = await detailFormRef.value?.validate()
    if (!isValid)
      return
    await submit(sharedEditSame.value, formData.value)
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
