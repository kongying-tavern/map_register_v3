import { pick } from 'lodash'
import type { ItemDetailForm } from '../components'
import { ItemEditor } from '../components'
import { GlobalDialogController, useFetchHook, useGlobalDialog } from '@/hooks'
import Api from '@/api/api'
import { GSMessageService } from '@/components'

export interface ItemEditHookOptions {
  /** 用于控制事件监听器只会被附加一次的 flag */
  isRoot?: boolean
  initFormData?: () => API.ItemVo
}

const sharedEditSame = ref<0 | 1>(0)

const { refresh: submit, onSuccess, onError, ...rest } = useFetchHook({
  onRequest: (editSame: 0 | 1, item: API.ItemVo) => Api.item.updateItem({ editSame }, [item]),
})

export const useItemEdit = (options: ItemEditHookOptions = {}) => {
  const { isRoot = false, initFormData } = options

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
    form.version = (form.version ?? 0) + 1
    await submit(sharedEditSame.value, form)
  }

  if (isRoot) {
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
  }

  const { DialogService } = useGlobalDialog()
  const openItemEditorDialog = (item: API.ItemVo, editSame: 0 | 1 = 0) => {
    DialogService
      .config({
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

  return { detailFormRef, formData, handleSubmit, openItemEditorDialog, onSuccess, onError, ...rest }
}
