import type { ItemDetailForm } from '../components'
import { useFetchHook } from '@/hooks'
import { GSMessageService, GlobalDialogController } from '@/components'
import { HiddenFlagEnum, IconStyle } from '@/shared'
import Api from '@/api/api'
import { useSocketStore } from '@/stores'

export interface ItemCreateHookOptions {
  /** 用于控制事件监听器只会被附加一次的 flag */
  isRoot?: boolean
}

export const useItemCreate = () => {
  const socketStore = useSocketStore()

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (item: API.ItemVo) => {
      const { error, message } = await Api.item.createItem(item)
      if (error)
        throw new Error(message)
      socketStore.socketEvent.emit('ItemAdded', item.id!)
    },
  })

  const initFormData = (): API.ItemVo => ({
    defaultCount: 1,
    defaultRefreshTime: 0,
    typeIdList: [],
    hiddenFlag: HiddenFlagEnum.SHOW,
    iconTag: '',
    iconStyleType: IconStyle.DEFAULT,
    sortIndex: 0,
  })

  const detailFormRef = ref<InstanceType<typeof ItemDetailForm> | null>(null)
  const formData = ref<API.ItemVo>(initFormData())

  const handleSubmit = async () => {
    const isValid = await detailFormRef.value?.validate()
    if (!isValid)
      return
    await submit(formData.value)
  }

  onSuccess(() => {
    GSMessageService.info('新增成功，数据同步可能需要几分钟时间', {
      type: 'success',
      duration: 5000,
    })
    GlobalDialogController.close()
  })

  onError(err => GSMessageService.info(`新增失败：${err.message}`, {
    type: 'error',
    duration: 5000,
  }))

  return { formData, detailFormRef, initFormData, handleSubmit, onSuccess, ...rest }
}
