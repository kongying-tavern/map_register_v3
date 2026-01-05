import type { ItemDetailForm } from '../components'
import type * as API2 from '@/api/alova/globals'
import { GSMessageService } from '@/components'
import { useFetchHook } from '@/hooks'
import { HiddenFlagEnum, IconStyle } from '@/shared'
import { useItemStore } from '@/stores'

export interface ItemCreateHookOptions {
  /** 用于控制事件监听器只会被附加一次的 flag */
  isRoot?: boolean
}

export const useItemCreate = () => {
  const itemStore = useItemStore()

  const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
    onRequest: async (item: API2.ItemVo) => {
      await itemStore.createItem(item)
    },
  })

  const initFormData = (): API2.ItemVo => ({
    defaultCount: 1,
    defaultRefreshTime: 0,
    typeIdList: [],
    hiddenFlag: HiddenFlagEnum.SHOW,
    iconId: undefined,
    iconStyleType: IconStyle.DEFAULT,
    sortIndex: 0,
  })

  const detailFormRef = ref<InstanceType<typeof ItemDetailForm> | null>(null)
  const formData = ref<API2.ItemVo>(initFormData())

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
  })

  onError(err => GSMessageService.info(`新增失败：${err.message}`, {
    type: 'error',
    duration: 5000,
  }))

  return { formData, detailFormRef, initFormData, handleSubmit, onSuccess, ...rest }
}
