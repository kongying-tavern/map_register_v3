import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash'
import type { Ref } from 'vue'
import { messageFrom } from '@/utils'

export interface RowEditHookOptions<T = unknown> {
  rowList: Ref<T[]>
  saveHandler: EditSaveHandler<T>
}

export type EditSaveHandler<T> = (rowList: Ref<T[]>, newRowData: T, oldRowData: T | null) => Promise<void>

export const useRowEdit = <T>(options: RowEditHookOptions<T>) => {
  const { rowList, saveHandler } = options

  const editLoading = ref(false)
  const rowCache = ref<null | Ref<T>>(null)
  const resetFlag = ref(true)

  const _editIndex = ref(-1)
  const editIndex = computed({
    get: () => _editIndex.value,
    set: (index) => {
      if (index !== -1) {
        rowCache.value = cloneDeep(rowList.value[index])
        resetFlag.value = true
      }

      _editIndex.value = index
    },
  })

  const isEditable = (index: number) => {
    return index === editIndex.value
  }

  const activeEdit = (index: number) => {
    editIndex.value = index
  }

  const exitEdit = () => {
    editIndex.value = -1
  }

  useEventListener(window, 'click', () => {
    if (resetFlag.value && rowCache.value)
      rowList.value[editIndex.value] = rowCache.value
    exitEdit()
  })

  const saveEdit = async () => {
    if (editIndex.value === -1)
      return
    try {
      editLoading.value = true
      await saveHandler(rowList, rowList.value[editIndex.value], rowCache.value)
      resetFlag.value = false
      exitEdit()
      ElMessage.success('修改成功')
    }
    catch (err) {
      ElMessage.error({
        message: `行编辑失败，原因为：${messageFrom(err)}`,
      })
    }
    finally {
      editLoading.value = false
    }
  }

  return { editIndex, editLoading, isEditable, saveEdit, activeEdit, exitEdit }
}
