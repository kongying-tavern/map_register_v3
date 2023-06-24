import type { ItemDetailForm } from '../components'
import { ItemEditor } from '../components'
import { useFetchHook, useGlobalDialog } from '@/hooks'
import Api from '@/api/api'

export interface ItemEditHookOptions {
  initFormData?: () => API.ItemVo
}

const sharedEditSame = ref<0 | 1>(0)

export const useItemEdit = (options: ItemEditHookOptions = {}) => {
  const { initFormData } = options

  const detailFormRef = ref<InstanceType<typeof ItemDetailForm> | null>(null)
  const formData = ref<API.ItemVo>(initFormData?.() ?? {})

  const { refresh: submitForm, ...rest } = useFetchHook({
    onRequest: () => Api.item.updateItem({
      editSame: sharedEditSame.value,
    }, [formData.value]),
  })

  const handleSubmit = async () => {
    const isValid = await detailFormRef.value?.validate()
    if (!isValid)
      return
    await submitForm()
  }

  const { DialogService } = useGlobalDialog()

  const openItemEditorDialog = (item: API.ItemVo, editSame: 0 | 1 = 0) => {
    DialogService
      .config({
        title: '编辑物品详情',
        width: 'fit-content',
        alignCenter: true,
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      })
      .props({
        item,
      })
      .open(ItemEditor)
    sharedEditSame.value = editSame
  }

  return { detailFormRef, formData, handleSubmit, openItemEditorDialog, ...rest }
}
