import type { ItemDetailForm } from '../components'
import type * as API2 from '@/api/alova/globals'
import { ElMessage } from 'element-plus'
import { pick } from 'lodash'
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
    ElMessage.success('编辑成功')
  })

  onError((err) => {
    ElMessage.error(`编辑失败，原因为：${err.message}`)
  })

  return { detailFormRef, formData, handleSubmit, onSuccess, onError, ...rest }
}
