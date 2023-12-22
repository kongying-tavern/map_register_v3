import type { ItemDetailForm } from '../components'
import { ItemCreator } from '../components'
import { useFetchHook, useGlobalDialog } from '@/hooks'
import { GSMessageService } from '@/components'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'
import { HiddenFlagEnum, IconStyleTyleEnum } from '@/shared'
import Api from '@/api/api'

const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
  onRequest: (item: API.ItemVo) => Api.item.createItem(item),
})

export interface ItemCreateHookOptions {
  /** 用于控制事件监听器只会被附加一次的 flag */
  isRoot?: boolean
}

export const useItemCreate = (options: ItemCreateHookOptions = {}) => {
  const { isRoot = false } = options

  const initFormData = (): API.ItemVo => ({
    defaultCount: 1,
    defaultRefreshTime: 0,
    typeIdList: [],
    hiddenFlag: HiddenFlagEnum.SHOW,
    iconStyleType: IconStyleTyleEnum.DEFAULT,
    sortIndex: 0,
  })

  const detailFormRef = ref<InstanceType<typeof ItemDetailForm> | null>(null)
  const formData = ref<API.ItemVo>(initFormData())

  const handleSubmit = () => detailFormRef.value
    ?.validate()
    ?.then(() => submit(formData.value))

  if (isRoot) {
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
  }

  const { DialogService } = useGlobalDialog()
  const openItemCreatorDialog = () => {
    DialogService
      .config({
        width: 'fit-content',
        alignCenter: true,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        showClose: false,
      })
      .open(ItemCreator)
  }

  return { formData, detailFormRef, openItemCreatorDialog, initFormData, handleSubmit, onSuccess, ...rest }
}
