import type { ItemDetailForm } from '../components'
import { ItemCreator } from '../components'
import { useFetchHook, useGlobalDialog } from '@/hooks'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'
import { HiddenFlagEnum, IconStyleTyleEnum } from '@/shared'
import Api from '@/api/api'

export const useItemCreate = () => {
  const { DialogService } = useGlobalDialog()

  const initFormData = (): API.ItemVo => ({
    defaultCount: 1,
    defaultRefreshTime: 0,
    typeIdList: [],
    hiddenFlag: HiddenFlagEnum.SHOW,
    iconStyleType: IconStyleTyleEnum.DEFAULT,
    sortIndex: 0,
  })

  const formData = ref<API.ItemVo>(initFormData())

  const detailFormRef = ref<InstanceType<typeof ItemDetailForm> | null>(null)

  const openItemCreatorDialog = () => DialogService
    .config({
      title: '新建物品',
      width: 'fit-content',
      alignCenter: true,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      showClose: false,
    })
    .open(ItemCreator)

  const { refresh: submit, ...rest } = useFetchHook({
    onRequest: () => Api.item.createItem(formData.value),
  })

  const handleSubmit = async () => {
    const isValid = await detailFormRef.value?.validate()
    if (!isValid)
      return
    await submit()
    GlobalDialogController.close()
  }

  return { formData, detailFormRef, openItemCreatorDialog, initFormData, handleSubmit, ...rest }
}
